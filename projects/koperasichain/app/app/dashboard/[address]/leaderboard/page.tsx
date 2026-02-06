'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '@/lib/anchor';
import Link from 'next/link';
import { WalletButton } from '@/app/components/wallet/WalletButton';
import ReputationBadge, { getNextMilestone } from '@/components/reputation/ReputationBadge';

interface CooperativeData {
  address: string;
  name: string;
}

interface MemberData {
  address: string;
  wallet: string;
  role: 'Admin' | 'Member' | 'Moderator';
  reputationScore: number;
  joinedAt: number;
  isActive: boolean;
}

export default function Leaderboard() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const params = useParams();
  const cooperativeAddress = params.address as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cooperative, setCooperative] = useState<CooperativeData | null>(null);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [currentMemberRank, setCurrentMemberRank] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, [cooperativeAddress, connection, wallet]);

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

      const coopData: CooperativeData = {
        address: cooperativeAddress,
        name: coopAccount.name,
      };

      setCooperative(coopData);

      // Fetch all members
      const allMembers = await program.account.member.all([
        {
          memcmp: {
            offset: 8,
            bytes: coopPubkey.toBase58(),
          },
        },
      ]);

      const memberData: MemberData[] = allMembers.map((member) => {
        const role = member.account.role;
        let roleStr: 'Admin' | 'Member' | 'Moderator' = 'Member';

        if (role.admin !== undefined) {
          roleStr = 'Admin';
        } else if (role.moderator !== undefined) {
          roleStr = 'Moderator';
        } else if (role.member !== undefined) {
          roleStr = 'Member';
        }

        return {
          address: member.publicKey.toBase58(),
          wallet: member.account.wallet.toBase58(),
          role: roleStr,
          reputationScore: member.account.reputationScore,
          joinedAt: member.account.joinedAt.toNumber(),
          isActive: member.account.isActive,
        };
      });

      // Sort by reputation score (descending)
      const sortedMembers = memberData.sort((a, b) => b.reputationScore - a.reputationScore);

      setMembers(sortedMembers);

      // Find current member rank
      if (wallet.publicKey) {
        const rank = sortedMembers.findIndex((m) => m.wallet === wallet.publicKey!.toBase58());
        if (rank !== -1) {
          setCurrentMemberRank(rank + 1); // Rank starts from 1
        }
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching leaderboard data:', err);
      setError('Failed to load leaderboard data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (!cooperative || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Leaderboard</h2>
          <p className="text-gray-600 mb-8">{error || 'Cooperative not found'}</p>
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

  const topThree = members.slice(0, 3);
  const restOfMembers = members.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center">
                <h1 className="text-2xl font-bold text-indigo-600">KoperasiChain</h1>
                <span className="ml-3 px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full">
                  Devnet
                </span>
              </Link>
              <Link
                href={`/dashboard/${cooperativeAddress}`}
                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
              >
                ← Back to Dashboard
              </Link>
            </div>
            <WalletButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Leaderboard</h2>
          <p className="text-gray-600">{cooperative.name}</p>
          {currentMemberRank && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
              <span className="text-sm text-gray-600">Your Rank:</span>
              <span className="text-lg font-bold text-indigo-600">#{currentMemberRank}</span>
            </div>
          )}
        </div>

        {/* Top 3 Podium */}
        {topThree.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Top Contributors</h3>
            <div className="flex items-end justify-center gap-4 md:gap-8">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="flex flex-col items-center">
                  <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-full p-1 mb-3">
                    <div className="bg-white rounded-full p-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-600">
                          {topThree[1].wallet.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-4 w-48">
                    <div className="text-center mb-2">
                      <div className="w-8 h-8 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-700">2</span>
                      </div>
                      <p className="text-sm font-mono text-gray-900 truncate">
                        {topThree[1].wallet.slice(0, 6)}...{topThree[1].wallet.slice(-4)}
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <ReputationBadge score={topThree[1].reputationScore} size="sm" />
                    </div>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <div className="flex flex-col items-center">
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full p-1 mb-3">
                    <div className="bg-white rounded-full p-4">
                      <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-3xl font-bold text-yellow-600">
                          {topThree[0].wallet.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-xl p-6 w-56 border-2 border-yellow-400">
                    <div className="text-center mb-3">
                      <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <p className="text-sm font-mono text-gray-900 truncate">
                        {topThree[0].wallet.slice(0, 6)}...{topThree[0].wallet.slice(-4)}
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <ReputationBadge score={topThree[0].reputationScore} size="md" />
                    </div>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="flex flex-col items-center">
                  <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-full p-1 mb-3">
                    <div className="bg-white rounded-full p-4">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-orange-600">
                          {topThree[2].wallet.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-4 w-48">
                    <div className="text-center mb-2">
                      <div className="w-8 h-8 mx-auto mb-2 bg-orange-200 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-orange-700">3</span>
                      </div>
                      <p className="text-sm font-mono text-gray-900 truncate">
                        {topThree[2].wallet.slice(0, 6)}...{topThree[2].wallet.slice(-4)}
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <ReputationBadge score={topThree[2].reputationScore} size="sm" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rest of Leaderboard */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Members ({members.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reputation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Milestone
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No members yet
                    </td>
                  </tr>
                ) : (
                  members.map((member, index) => {
                    const isCurrentUser = wallet.publicKey && member.wallet === wallet.publicKey.toBase58();
                    const nextMilestone = getNextMilestone(member.reputationScore);

                    return (
                      <tr
                        key={member.address}
                        className={`hover:bg-gray-50 ${isCurrentUser ? 'bg-indigo-50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {index < 3 ? (
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                                'bg-gradient-to-br from-orange-400 to-orange-600'
                              }`}>
                                {index + 1}
                              </div>
                            ) : (
                              <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 font-medium">
                                {member.wallet.slice(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-mono text-gray-900">
                                {member.wallet.slice(0, 6)}...{member.wallet.slice(-4)}
                                {isCurrentUser && (
                                  <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded">
                                    You
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            member.role === 'Admin'
                              ? 'bg-indigo-100 text-indigo-800'
                              : member.role === 'Moderator'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <ReputationBadge score={member.reputationScore} size="sm" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {nextMilestone ? (
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">{nextMilestone.name}</span>
                              <span className="text-gray-400 ml-1">
                                (+{nextMilestone.remaining})
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-purple-600 font-medium">Max Level!</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reputation Info */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Earn Reputation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Cast Votes</p>
                <p className="text-sm text-gray-600">Earn +10 points per vote</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Create Proposals</p>
                <p className="text-sm text-gray-600">Contribute to governance</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Active Participation</p>
                <p className="text-sm text-gray-600">Consistent engagement rewards</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
