'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '@/lib/anchor';
import Link from 'next/link';
import { WalletButton } from '@/app/components/wallet/WalletButton';

interface CooperativeData {
  address: string;
  authority: string;
  name: string;
  description: string;
  memberCount: number;
  votingPeriodDays: number;
  quorumPercentage: number;
  createdAt: number;
}

interface MemberData {
  address: string;
  wallet: string;
  role: 'Admin' | 'Member' | 'Moderator';
  reputationScore: number;
  joinedAt: number;
  isActive: boolean;
}

export default function CooperativeDashboard() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const params = useParams();
  const cooperativeAddress = params.address as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cooperative, setCooperative] = useState<CooperativeData | null>(null);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [isAuthority, setIsAuthority] = useState(false);

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

        const coopData: CooperativeData = {
          address: cooperativeAddress,
          authority: coopAccount.authority.toBase58(),
          name: coopAccount.name,
          description: coopAccount.description,
          memberCount: coopAccount.memberCount,
          votingPeriodDays: coopAccount.votingPeriodDays,
          quorumPercentage: coopAccount.quorumPercentage,
          createdAt: coopAccount.createdAt.toNumber(),
        };

        setCooperative(coopData);

        // Check if current wallet is authority
        if (wallet.publicKey) {
          setIsAuthority(wallet.publicKey.toBase58() === coopData.authority);
        }

        // Fetch all members
        const allMembers = await program.account.member.all([
          {
            memcmp: {
              offset: 8, // After discriminator
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

        setMembers(memberData);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching cooperative data:', err);
        setError('Failed to load cooperative data');
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
          <p className="text-gray-600">Loading dashboard...</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Dashboard</h2>
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

  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/join?coop=${cooperativeAddress}`;

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
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{cooperative.name}</h2>
              <p className="text-gray-600 mb-3">{cooperative.description}</p>
              <Link
                href={`/dashboard/${cooperativeAddress}/leaderboard`}
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                View Leaderboard →
              </Link>
            </div>
            {isAuthority && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-semibold rounded-full">
                Authority
              </span>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Members</p>
                <p className="text-3xl font-bold text-gray-900">{cooperative.memberCount}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Voting Period</p>
                <p className="text-3xl font-bold text-gray-900">{cooperative.votingPeriodDays}<span className="text-lg text-gray-500 ml-1">days</span></p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Quorum Required</p>
                <p className="text-3xl font-bold text-gray-900">{cooperative.quorumPercentage}<span className="text-lg text-gray-500 ml-1">%</span></p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href={`/dashboard/${cooperativeAddress}/proposals`}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Proposals & Voting</h3>
                <p className="text-indigo-100 mb-4">View and vote on cooperative proposals</p>
                <span className="inline-flex items-center text-white font-semibold group-hover:gap-2 transition-all">
                  View Proposals
                  <svg className="w-5 h-5 ml-1 group-hover:ml-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </div>
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            href={`/dashboard/${cooperativeAddress}/treasury`}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Treasury</h3>
                <p className="text-green-100 mb-4">Manage cooperative funds and dividends</p>
                <span className="inline-flex items-center text-white font-semibold group-hover:gap-2 transition-all">
                  Manage Treasury
                  <svg className="w-5 h-5 ml-1 group-hover:ml-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </div>
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            href={`/dashboard/${cooperativeAddress}/members`}
            className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Members</h3>
                <p className="text-orange-100 mb-4">Manage roles and reputation</p>
                <span className="inline-flex items-center text-white font-semibold group-hover:gap-2 transition-all">
                  View Members
                  <svg className="w-5 h-5 ml-1 group-hover:ml-2 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </div>
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Invite Section */}
        {isAuthority && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite New Members</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-mono text-gray-700 bg-gray-50"
                onClick={(e) => e.currentTarget.select()}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                  alert('Invite link copied to clipboard!');
                }}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                Copy Link
              </button>
              <button
                onClick={() => {
                  const message = `Join our cooperative "${cooperative.name}" on KoperasiChain! ${inviteLink}`;
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank');
                }}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Members ({members.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reputation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No members yet. Share the invite link to add members.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.address} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-medium text-sm">
                              {member.wallet.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-mono text-gray-900">
                              {member.wallet.slice(0, 4)}...{member.wallet.slice(-4)}
                            </p>
                            <a
                              href={`https://explorer.solana.com/address/${member.wallet}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-600 hover:text-indigo-800"
                            >
                              View on Explorer
                            </a>
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
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-semibold text-gray-900">{member.reputationScore}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900">
                          {new Date(member.joinedAt * 1000).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(member.joinedAt * 1000).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.isActive ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cooperative Info */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cooperative Information</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Contract Address</dt>
              <dd className="mt-1 text-sm font-mono text-gray-900 break-all">{cooperative.address}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Authority</dt>
              <dd className="mt-1 text-sm font-mono text-gray-900 break-all">{cooperative.authority}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(cooperative.createdAt * 1000).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Network</dt>
              <dd className="mt-1">
                <a
                  href={`https://explorer.solana.com/address/${cooperative.address}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View on Solana Explorer →
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  );
}
