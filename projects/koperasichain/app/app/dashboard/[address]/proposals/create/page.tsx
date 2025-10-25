'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { SystemProgram, PublicKey } from '@solana/web3.js';
import { getProgram, getMemberPDA, getProposalPDA } from '@/lib/anchor';
import Link from 'next/link';

export default function CreateProposalPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const params = useParams();
  const router = useRouter();
  const cooperativeAddress = params.address as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ signature: string; proposalPda: string } | null>(null);
  const [cooperative, setCooperative] = useState<any>(null);
  const [isMember, setIsMember] = useState(false);
  const [loadingCheck, setLoadingCheck] = useState(true);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [proposalType, setProposalType] = useState('TextProposal');

  useEffect(() => {
    const checkMembership = async () => {
      if (!cooperativeAddress || !wallet.publicKey) {
        setLoadingCheck(false);
        return;
      }

      try {
        const program = getProgram(wallet as any, connection);
        const coopPubkey = new PublicKey(cooperativeAddress);

        // Fetch cooperative data
        const coopAccount = await program.account.cooperative.fetch(coopPubkey);
        setCooperative({
          address: cooperativeAddress,
          name: coopAccount.name,
          ...coopAccount,
        });

        // Check if current wallet is an active member
        const [memberPda] = await getMemberPDA(coopPubkey, wallet.publicKey);
        const memberAccount = await program.account.member.fetch(memberPda);
        setIsMember(memberAccount.isActive);
        setLoadingCheck(false);
      } catch (err) {
        console.error('Error checking membership:', err);
        setIsMember(false);
        setLoadingCheck(false);
      }
    };

    checkMembership();
  }, [cooperativeAddress, connection, wallet.publicKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet.publicKey || !wallet.signTransaction) {
      setError('Please connect your wallet first');
      return;
    }

    if (!isMember) {
      setError('Only active members can create proposals');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      const program = getProgram(wallet as any, connection);
      const cooperativePda = new PublicKey(cooperativeAddress);

      const [proposalPda] = await getProposalPDA(cooperativePda, title);
      const [memberPda] = await getMemberPDA(cooperativePda, wallet.publicKey);

      // Map proposal type to enum
      const proposalTypeEnum = { [proposalType.toLowerCase()]: {} };

      const tx = await program.methods
        .createProposal(title, description, proposalTypeEnum)
        .accounts({
          proposal: proposalPda,
          cooperative: cooperativePda,
          member: memberPda,
          proposer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setSuccess({
        signature: tx,
        proposalPda: proposalPda.toBase58(),
      });

      // Reset form
      setTitle('');
      setDescription('');
      setProposalType('TextProposal');

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/dashboard/${cooperativeAddress}/proposals`);
      }, 2000);
    } catch (err: any) {
      console.error('Error creating proposal:', err);
      setError(err.message || 'Failed to create proposal');
    } finally {
      setLoading(false);
    }
  };

  if (loadingCheck) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Checking membership...</p>
        </div>
      </div>
    );
  }

  if (!wallet.connected || !isMember) {
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
              <WalletMultiButton />
            </div>
          </div>
        </nav>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Members Only</h2>
            <p className="text-gray-600 mb-8">
              {!wallet.connected
                ? 'Please connect your wallet to create proposals'
                : 'Only active cooperative members can create proposals'}
            </p>
            <div className="flex flex-col gap-3">
              {!wallet.connected ? (
                <WalletMultiButton className="!w-full" />
              ) : (
                <Link
                  href={`/dashboard/${cooperativeAddress}`}
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Back to Dashboard
                </Link>
              )}
            </div>
          </div>
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
            <WalletMultiButton />
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Proposal Created!</h2>
            <p className="text-gray-600 mb-8">Your proposal has been submitted for voting</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-green-700 font-mono break-all mb-2">
                <span className="font-semibold">Proposal:</span> {success.proposalPda}
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
            <p className="text-sm text-gray-500 mb-6">Redirecting to proposals page...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Link href={`/dashboard/${cooperativeAddress}`} className="hover:text-indigo-600">
                  {cooperative?.name || 'Dashboard'}
                </Link>
                <span>/</span>
                <Link href={`/dashboard/${cooperativeAddress}/proposals`} className="hover:text-indigo-600">
                  Proposals
                </Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">Create</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Proposal</h2>
              <p className="text-gray-600">Submit a new proposal for cooperative members to vote on</p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Proposal Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a clear, concise title (max 100 characters)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    maxLength={100}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">{title.length}/100 characters</p>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide detailed information about your proposal (max 500 characters)"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    maxLength={500}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">{description.length}/500 characters</p>
                </div>

                {/* Proposal Type */}
                <div>
                  <label htmlFor="proposalType" className="block text-sm font-semibold text-gray-700 mb-2">
                    Proposal Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="proposalType"
                    value={proposalType}
                    onChange={(e) => setProposalType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    <option value="TextProposal">Text Proposal - General discussion or decision</option>
                    <option value="FundAllocation">Fund Allocation - Budget or financial decision</option>
                    <option value="MemberRemoval">Member Removal - Remove a member from cooperative</option>
                  </select>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading || !title || !description}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Proposal...
                      </>
                    ) : (
                      'Create Proposal'
                    )}
                  </button>
                  <Link
                    href={`/dashboard/${cooperativeAddress}/proposals`}
                    className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-lg transition-colors"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
