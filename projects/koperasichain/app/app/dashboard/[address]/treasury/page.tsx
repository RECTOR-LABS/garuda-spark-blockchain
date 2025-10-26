'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getProgram } from '@/lib/anchor';
import { BN } from '@coral-xyz/anchor';
import Link from 'next/link';

interface TreasuryData {
  cooperative: string;
  balance: number; // in lamports
  allocatedAmount: number;
  totalDistributed: number;
  lastDepositAt: number;
  lastWithdrawalAt: number;
  lastDistributionAt: number;
  depositCount: number;
  withdrawalCount: number;
  distributionCount: number;
}

interface CooperativeData {
  authority: string;
  name: string;
  memberCount: number;
}

export default function TreasuryDashboard() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const router = useRouter();
  const params = useParams();
  const cooperativeAddress = params.address as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [treasury, setTreasury] = useState<TreasuryData | null>(null);
  const [cooperative, setCooperative] = useState<CooperativeData | null>(null);
  const [isAuthority, setIsAuthority] = useState(false);
  const [isMember, setIsMember] = useState(false);

  // Deposit form state
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);

  // Dividend form state
  const [distributionAmount, setDistributionAmount] = useState('');
  const [distributing, setDistributing] = useState(false);

  useEffect(() => {
    fetchTreasuryData();
  }, [cooperativeAddress, wallet.publicKey]);

  const fetchTreasuryData = async () => {
    if (!cooperativeAddress) {
      setError('No cooperative address provided');
      setLoading(false);
      return;
    }

    try {
      const program = getProgram(wallet as any, connection);
      const coopPubkey = new PublicKey(cooperativeAddress);

      // Fetch cooperative data
      const coopAccount = await program.account.cooperative.fetch(coopPubkey);
      setCooperative({
        authority: coopAccount.authority.toBase58(),
        name: coopAccount.name,
        memberCount: coopAccount.memberCount,
      });

      // Check authority
      if (wallet.publicKey) {
        setIsAuthority(wallet.publicKey.toBase58() === coopAccount.authority.toBase58());

        // Check if user is a member
        try {
          const [memberPda] = PublicKey.findProgramAddressSync(
            [
              Buffer.from('member'),
              coopPubkey.toBuffer(),
              wallet.publicKey.toBuffer(),
            ],
            program.programId
          );
          const memberAccount = await program.account.member.fetch(memberPda);
          setIsMember(memberAccount.isActive);
        } catch {
          setIsMember(false);
        }
      }

      // Fetch treasury data
      const [treasuryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury'), coopPubkey.toBuffer()],
        program.programId
      );

      try {
        const treasuryAccount = await program.account.treasury.fetch(treasuryPda);
        setTreasury({
          cooperative: treasuryAccount.cooperative.toBase58(),
          balance: treasuryAccount.balance.toNumber(),
          allocatedAmount: treasuryAccount.allocatedAmount.toNumber(),
          totalDistributed: treasuryAccount.totalDistributed.toNumber(),
          lastDepositAt: treasuryAccount.lastDepositAt.toNumber(),
          lastWithdrawalAt: treasuryAccount.lastWithdrawalAt.toNumber(),
          lastDistributionAt: treasuryAccount.lastDistributionAt.toNumber(),
          depositCount: treasuryAccount.depositCount,
          withdrawalCount: treasuryAccount.withdrawalCount,
          distributionCount: treasuryAccount.distributionCount,
        });
      } catch {
        // Treasury not initialized yet
        setTreasury(null);
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching treasury data:', err);
      setError('Failed to load treasury data');
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.publicKey || !cooperativeAddress || !isMember) {
      setError('You must be a member to deposit funds');
      return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setDepositing(true);
    setError('');
    setSuccess('');

    try {
      const program = getProgram(wallet as any, connection);
      const coopPubkey = new PublicKey(cooperativeAddress);

      const [treasuryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury'), coopPubkey.toBuffer()],
        program.programId
      );

      const [memberPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('member'),
          coopPubkey.toBuffer(),
          wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

      const amountLamports = new BN(amount * LAMPORTS_PER_SOL);

      const tx = await program.methods
        .depositFunds(amountLamports)
        .accounts({
          treasury: treasuryPda,
          cooperative: coopPubkey,
          member: memberPda,
          depositor: wallet.publicKey,
        })
        .rpc();

      setSuccess(`Deposit successful! Transaction: ${tx}`);
      setDepositAmount('');

      // Refresh treasury data
      setTimeout(() => fetchTreasuryData(), 2000);
    } catch (err: any) {
      console.error('Deposit error:', err);
      setError(err.message || 'Deposit failed');
    } finally {
      setDepositing(false);
    }
  };

  const handleDistributeDividends = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.publicKey || !isAuthority) {
      setError('Only the cooperative authority can distribute dividends');
      return;
    }

    const amount = parseFloat(distributionAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid distribution amount');
      return;
    }

    setDistributing(true);
    setError('');
    setSuccess('');

    try {
      const program = getProgram(wallet as any, connection);
      const coopPubkey = new PublicKey(cooperativeAddress);

      const [treasuryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury'), coopPubkey.toBuffer()],
        program.programId
      );

      const amountLamports = new BN(amount * LAMPORTS_PER_SOL);

      const tx = await program.methods
        .distributeDividends(amountLamports)
        .accounts({
          treasury: treasuryPda,
          cooperative: coopPubkey,
          authority: wallet.publicKey,
        })
        .rpc();

      setSuccess(`Dividend distribution successful! Transaction: ${tx}`);
      setDistributionAmount('');

      // Refresh treasury data
      setTimeout(() => fetchTreasuryData(), 2000);
    } catch (err: any) {
      console.error('Distribution error:', err);
      setError(err.message || 'Distribution failed');
    } finally {
      setDistributing(false);
    }
  };

  const availableBalance = treasury
    ? (treasury.balance - treasury.allocatedAmount) / LAMPORTS_PER_SOL
    : 0;
  const totalBalance = treasury ? treasury.balance / LAMPORTS_PER_SOL : 0;
  const allocatedSOL = treasury ? treasury.allocatedAmount / LAMPORTS_PER_SOL : 0;
  const distributedSOL = treasury ? treasury.totalDistributed / LAMPORTS_PER_SOL : 0;

  const perMemberShare = cooperative && treasury && cooperative.memberCount > 0
    ? availableBalance / cooperative.memberCount
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">Loading treasury data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href={`/dashboard/${cooperativeAddress}`}
              className="text-purple-600 hover:text-purple-800 mb-2 inline-block"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">
              Treasury Management
            </h1>
            {cooperative && (
              <p className="text-gray-600 mt-2">{cooperative.name}</p>
            )}
          </div>
          <WalletMultiButton />
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
            <a
              href={`https://explorer.solana.com/tx/${success.split(': ')[1]}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 underline"
            >
              View on Explorer →
            </a>
          </div>
        )}

        {/* Treasury Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Total Balance</div>
            <div className="text-3xl font-bold text-purple-600">
              {totalBalance.toFixed(4)} SOL
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Available</div>
            <div className="text-3xl font-bold text-green-600">
              {availableBalance.toFixed(4)} SOL
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Allocated</div>
            <div className="text-3xl font-bold text-orange-600">
              {allocatedSOL.toFixed(4)} SOL
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Total Distributed</div>
            <div className="text-3xl font-bold text-blue-600">
              {distributedSOL.toFixed(4)} SOL
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        {treasury && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Activity Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border-l-4 border-green-500 pl-4">
                <div className="text-2xl font-bold text-gray-900">
                  {treasury.depositCount}
                </div>
                <div className="text-sm text-gray-600">Total Deposits</div>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <div className="text-2xl font-bold text-gray-900">
                  {treasury.withdrawalCount}
                </div>
                <div className="text-sm text-gray-600">Total Withdrawals</div>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="text-2xl font-bold text-gray-900">
                  {treasury.distributionCount}
                </div>
                <div className="text-sm text-gray-600">Dividend Distributions</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Deposit Form (Members only) */}
          {isMember && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                💰 Deposit Funds
              </h2>
              <form onSubmit={handleDeposit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Amount (SOL)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="0.5"
                    disabled={depositing}
                  />
                </div>
                <button
                  type="submit"
                  disabled={depositing || !wallet.publicKey}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                >
                  {depositing ? 'Depositing...' : 'Deposit to Treasury'}
                </button>
              </form>
            </div>
          )}

          {/* Distribute Dividends (Admin only) */}
          {isAuthority && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                🎁 Distribute Dividends
              </h2>
              <form onSubmit={handleDistributeDividends}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Total Amount (SOL)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={distributionAmount}
                    onChange={(e) => setDistributionAmount(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="1.0"
                    disabled={distributing}
                  />
                  {distributionAmount && cooperative && (
                    <div className="mt-2 text-sm text-gray-600">
                      Each member receives: {' '}
                      <span className="font-bold text-purple-600">
                        {(parseFloat(distributionAmount) / cooperative.memberCount).toFixed(4)} SOL
                      </span>
                    </div>
                  )}
                </div>
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-sm text-gray-700">
                    <strong>Available:</strong> {availableBalance.toFixed(4)} SOL
                  </div>
                  <div className="text-sm text-gray-700">
                    <strong>Members:</strong> {cooperative?.memberCount || 0}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={distributing || !wallet.publicKey || !treasury}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                >
                  {distributing ? 'Distributing...' : 'Distribute to All Members'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Allocation Breakdown */}
        {treasury && totalBalance > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Balance Breakdown
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Available Balance</span>
                  <span className="font-bold text-green-600">
                    {((availableBalance / totalBalance) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full"
                    style={{ width: `${(availableBalance / totalBalance) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Allocated (Proposals)</span>
                  <span className="font-bold text-orange-600">
                    {((allocatedSOL / totalBalance) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-orange-500 h-4 rounded-full"
                    style={{ width: `${(allocatedSOL / totalBalance) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Treasury Yet */}
        {!treasury && !loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-500 text-lg mb-4">
              Treasury not initialized yet
            </div>
            <p className="text-gray-600 mb-6">
              Make your first deposit to initialize the treasury
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
