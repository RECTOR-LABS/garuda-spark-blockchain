'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram, getMemberPDA } from '@/lib/anchor';
import Link from 'next/link';
import { WalletButton } from '@/app/components/wallet/WalletButton';

interface ProposalData {
  address: string;
  cooperative: string;
  proposer: string;
  title: string;
  description: string;
  proposalType: string;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  status: string;
  createdAt: number;
  endsAt: number;
}

export default function ProposalsPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const params = useParams();
  const router = useRouter();
  const cooperativeAddress = params.address as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [cooperative, setCooperative] = useState<any>(null);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
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
          address: cooperativeAddress,
          name: coopAccount.name,
          ...coopAccount,
        });

        // Check if current wallet is a member
        if (wallet.publicKey) {
          try {
            const [memberPda] = await getMemberPDA(coopPubkey, wallet.publicKey);
            const memberAccount = await program.account.member.fetch(memberPda);
            setIsMember(memberAccount.isActive);
          } catch (err) {
            setIsMember(false);
          }
        }

        // Fetch all proposals
        const allProposals = await program.account.proposal.all([
          {
            memcmp: {
              offset: 8, // After discriminator
              bytes: coopPubkey.toBase58(),
            },
          },
        ]);

        const proposalData: ProposalData[] = allProposals.map((proposal) => ({
          address: proposal.publicKey.toBase58(),
          cooperative: proposal.account.cooperative.toBase58(),
          proposer: proposal.account.proposer.toBase58(),
          title: proposal.account.title,
          description: proposal.account.description,
          proposalType: Object.keys(proposal.account.proposalType)[0],
          yesVotes: proposal.account.yesVotes,
          noVotes: proposal.account.noVotes,
          abstainVotes: proposal.account.abstainVotes,
          status: Object.keys(proposal.account.status)[0],
          createdAt: proposal.account.createdAt.toNumber(),
          endsAt: proposal.account.endsAt.toNumber(),
        }));

        // Sort by creation date (newest first)
        proposalData.sort((a, b) => b.createdAt - a.createdAt);

        setProposals(proposalData);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching proposals:', err);
        setError('Failed to load proposals');
        setLoading(false);
      }
    };

    fetchData();
  }, [cooperativeAddress, connection, wallet]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading proposals...</p>
        </div>
      </div>
    );
  }

  if (error || !cooperative) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Proposals</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link
            href={`/dashboard/${cooperativeAddress}`}
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'executed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProposalTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'textproposal':
        return 'bg-gray-100 text-gray-800';
      case 'fundallocation':
        return 'bg-yellow-100 text-yellow-800';
      case 'memberremoval':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatProposalType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'textproposal':
        return 'Text Proposal';
      case 'fundallocation':
        return 'Fund Allocation';
      case 'memberremoval':
        return 'Member Removal';
      default:
        return type;
    }
  };

  const isVotingActive = (proposal: ProposalData) => {
    const now = Date.now() / 1000;
    return proposal.status.toLowerCase() === 'active' && now <= proposal.endsAt;
  };

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href={`/dashboard/${cooperativeAddress}`} className="hover:text-indigo-600">
              {cooperative.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Proposals</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Proposals</h2>
              <p className="text-gray-600">View and vote on cooperative proposals</p>
            </div>
            {isMember && (
              <Link
                href={`/dashboard/${cooperativeAddress}/proposals/create`}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Proposal
              </Link>
            )}
          </div>
        </div>

        {/* Proposals List */}
        <div className="space-y-4">
          {proposals.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Proposals Yet</h3>
              <p className="text-gray-600 mb-6">Be the first to create a proposal for this cooperative</p>
              {isMember && (
                <Link
                  href={`/dashboard/${cooperativeAddress}/proposals/create`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create First Proposal
                </Link>
              )}
            </div>
          ) : (
            proposals.map((proposal) => {
              const totalVotes = proposal.yesVotes + proposal.noVotes + proposal.abstainVotes;
              const yesPercentage = totalVotes > 0 ? (proposal.yesVotes / totalVotes) * 100 : 0;
              const noPercentage = totalVotes > 0 ? (proposal.noVotes / totalVotes) * 100 : 0;

              return (
                <div
                  key={proposal.address}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(proposal.status)}`}>
                            {proposal.status}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getProposalTypeColor(proposal.proposalType)}`}>
                            {formatProposalType(proposal.proposalType)}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{proposal.title}</h3>
                        <p className="text-gray-600 line-clamp-2">{proposal.description}</p>
                      </div>
                    </div>

                    {/* Vote Tallies */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Votes</span>
                        <span className="font-semibold text-gray-900">{totalVotes} total</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-green-700">Yes</span>
                            <span className="font-medium text-green-700">{proposal.yesVotes} ({yesPercentage.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${yesPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-red-700">No</span>
                            <span className="font-medium text-red-700">{proposal.noVotes} ({noPercentage.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full transition-all"
                              style={{ width: `${noPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        {isVotingActive(proposal) ? (
                          <span>Ends {new Date(proposal.endsAt * 1000).toLocaleDateString()}</span>
                        ) : (
                          <span>Ended {new Date(proposal.endsAt * 1000).toLocaleDateString()}</span>
                        )}
                      </div>
                      <Link
                        href={`/dashboard/${cooperativeAddress}/proposals/${proposal.address}`}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
