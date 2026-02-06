'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram, PublicKey } from '@solana/web3.js';
import { WalletButton } from '@/app/components/wallet/WalletButton';
import { getProgram, getMemberPDA } from '@/lib/anchor';
import Link from 'next/link';

function JoinPageContent() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const searchParams = useSearchParams();
  const cooperativeAddress = searchParams.get('coop');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ signature: string; memberPda: string } | null>(null);
  const [cooperative, setCooperative] = useState<any>(null);
  const [loadingCoop, setLoadingCoop] = useState(true);

  // Fetch cooperative details
  useEffect(() => {
    if (!cooperativeAddress) {
      setError('No cooperative address provided');
      setLoadingCoop(false);
      return;
    }

    const fetchCooperative = async () => {
      try {
        const program = getProgram(wallet as any, connection);
        const coopPubkey = new PublicKey(cooperativeAddress);
        const coopAccount = await program.account.cooperative.fetch(coopPubkey);
        setCooperative({
          address: cooperativeAddress,
          ...coopAccount,
        });
        setLoadingCoop(false);
      } catch (err: any) {
        console.error('Error fetching cooperative:', err);
        setError('Failed to load cooperative details');
        setLoadingCoop(false);
      }
    };

    fetchCooperative();
  }, [cooperativeAddress, connection, wallet]);

  const handleJoin = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setError('Please connect your wallet first');
      return;
    }

    if (!cooperativeAddress) {
      setError('No cooperative address provided');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      const program = getProgram(wallet as any, connection);
      const cooperativePda = new PublicKey(cooperativeAddress);

      const [memberPda] = await getMemberPDA(cooperativePda, wallet.publicKey);

      const tx = await program.methods
        .addMember()
        .accounts({
          cooperative: cooperativePda,
          member: memberPda,
          memberWallet: wallet.publicKey,
          authority: cooperative.authority,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setSuccess({
        signature: tx,
        memberPda: memberPda.toBase58(),
      });
    } catch (err: any) {
      console.error('Error joining cooperative:', err);
      setError(err.message || 'Failed to join cooperative');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCoop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading cooperative details...</p>
        </div>
      </div>
    );
  }

  if (error && !cooperative) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Invite Link</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link
            href="/"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">KoperasiChain</h1>
              <span className="ml-3 px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full">
                Devnet
              </span>
            </Link>
            <WalletButton />
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {success ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to the Cooperative!</h2>
            <p className="text-gray-600 mb-8">
              You've successfully joined <span className="font-semibold">{cooperative.name}</span>
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-green-700 font-mono break-all mb-2">
                <span className="font-semibold">Member Account:</span> {success.memberPda}
              </p>
              <a
                href={`https://explorer.solana.com/tx/${success.signature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-green-600 hover:text-green-800 font-medium text-sm"
              >
                View on Solana Explorer
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/dashboard/${cooperativeAddress}`}
                className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                View Dashboard
              </Link>
              <Link
                href="/"
                className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Go to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Cooperative</h2>
              <p className="text-gray-600">You've been invited to join a cooperative</p>
            </div>

            {cooperative && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{cooperative.name}</h3>
                <p className="text-gray-600 mb-4">{cooperative.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Members:</span>
                    <span className="ml-2 font-semibold text-gray-900">{cooperative.memberCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Voting Period:</span>
                    <span className="ml-2 font-semibold text-gray-900">{cooperative.votingPeriodDays} days</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Quorum:</span>
                    <span className="ml-2 font-semibold text-gray-900">{cooperative.quorumPercentage}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {new Date(cooperative.createdAt.toNumber() * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {!wallet.connected ? (
              <div className="text-center">
                <p className="text-gray-600 mb-6">Connect your wallet to join this cooperative</p>
                <WalletButton className="!bg-indigo-600 hover:!bg-indigo-700" />
              </div>
            ) : (
              <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Joining Cooperative...
                  </>
                ) : (
                  'Join Cooperative'
                )}
              </button>
            )}

            {wallet.connected && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Connected wallet: <span className="ml-2 font-mono text-xs">{wallet.publicKey?.toBase58().slice(0, 8)}...{wallet.publicKey?.toBase58().slice(-8)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <JoinPageContent />
    </Suspense>
  );
}
