'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getProgram } from '@/lib/anchor';
import Link from 'next/link';
import { WalletButton } from '@/app/components/wallet/WalletButton';
import { BN } from '@coral-xyz/anchor';

interface CooperativeData {
  address: string;
  authority: string;
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

export default function MembersManagement() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const params = useParams();
  const cooperativeAddress = params.address as string;

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooperative, setCooperative] = useState<CooperativeData | null>(null);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [currentMember, setCurrentMember] = useState<MemberData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<'Admin' | 'Member' | 'Moderator'>('Member');
  const [reputationPoints, setReputationPoints] = useState(10);

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
        authority: coopAccount.authority.toBase58(),
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

      setMembers(memberData);

      // Check if current wallet is a member and their role
      if (wallet.publicKey) {
        const currentMemberData = memberData.find(
          (m) => m.wallet === wallet.publicKey!.toBase58()
        );

        if (currentMemberData) {
          setCurrentMember(currentMemberData);
          setIsAdmin(currentMemberData.role === 'Admin');
        }
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to load members data');
      setLoading(false);
    }
  };

  const handleUpdateRole = async (memberWallet: string) => {
    if (!wallet.publicKey || !isAdmin) {
      setError('Only admins can update member roles');
      return;
    }

    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const program = getProgram(wallet as any, connection);
      const coopPubkey = new PublicKey(cooperativeAddress);
      const targetWallet = new PublicKey(memberWallet);

      // Derive member PDAs
      const [memberPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), coopPubkey.toBuffer(), targetWallet.toBuffer()],
        program.programId
      );

      const [updaterMemberPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), coopPubkey.toBuffer(), wallet.publicKey.toBuffer()],
        program.programId
      );

      // Convert role string to enum format
      let roleEnum: any;
      if (newRole === 'Admin') {
        roleEnum = { admin: {} };
      } else if (newRole === 'Moderator') {
        roleEnum = { moderator: {} };
      } else {
        roleEnum = { member: {} };
      }

      const tx = await program.methods
        .updateMemberRole(roleEnum)
        .accounts({
          member: memberPda,
          updaterMember: updaterMemberPda,
          cooperative: coopPubkey,
          updater: wallet.publicKey,
        })
        .rpc();

      setSuccess(`Role updated successfully! Transaction: ${tx}`);
      setSelectedMember(null);

      // Refresh data
      await fetchData();
    } catch (err: any) {
      console.error('Error updating role:', err);
      setError(err.message || 'Failed to update role');
    } finally {
      setUpdating(false);
    }
  };

  const handleIncrementReputation = async (memberWallet: string) => {
    if (!wallet.publicKey || !isAdmin) {
      setError('Only admins can update reputation');
      return;
    }

    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const program = getProgram(wallet as any, connection);
      const coopPubkey = new PublicKey(cooperativeAddress);
      const targetWallet = new PublicKey(memberWallet);

      // Derive member PDA
      const [memberPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), coopPubkey.toBuffer(), targetWallet.toBuffer()],
        program.programId
      );

      const tx = await program.methods
        .incrementReputation(reputationPoints)
        .accounts({
          member: memberPda,
          cooperative: coopPubkey,
        })
        .rpc();

      setSuccess(`Reputation increased by ${reputationPoints} points! Transaction: ${tx}`);

      // Refresh data
      await fetchData();
    } catch (err: any) {
      console.error('Error incrementing reputation:', err);
      setError(err.message || 'Failed to increment reputation');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading members...</p>
        </div>
      </div>
    );
  }

  if (!cooperative) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Data</h2>
          <p className="text-gray-600 mb-8">{error || 'Cooperative not found'}</p>
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

  if (!currentMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-8">You must be a member of this cooperative to access member management.</p>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Member Management</h2>
          <p className="text-gray-600">{cooperative.name}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
              isAdmin
                ? 'bg-indigo-100 text-indigo-800'
                : currentMember.role === 'Moderator'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              Your Role: {currentMember.role}
            </span>
            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
              Reputation: {currentMember.reputationScore}
            </span>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <p className="mt-1 text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {!isAdmin && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">View Only</h3>
                <p className="mt-1 text-sm text-yellow-700">Only admins can update member roles and reputation.</p>
              </div>
            </div>
          </div>
        )}

        {/* Members Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Members ({members.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="px-6 py-8 text-center text-gray-500">
                      No members found
                    </td>
                  </tr>
                ) : (
                  members
                    .sort((a, b) => {
                      // Sort by role: Admin > Moderator > Member
                      const roleOrder = { Admin: 0, Moderator: 1, Member: 2 };
                      if (roleOrder[a.role] !== roleOrder[b.role]) {
                        return roleOrder[a.role] - roleOrder[b.role];
                      }
                      // Then by reputation score (descending)
                      return b.reputationScore - a.reputationScore;
                    })
                    .map((member) => (
                      <tr key={member.address} className="hover:bg-gray-50">
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
                              </p>
                              <a
                                href={`https://explorer.solana.com/address/${member.wallet}?cluster=devnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-600 hover:text-indigo-800"
                              >
                                View on Explorer →
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
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
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
                        {isAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedMember(member.wallet);
                                  setNewRole(member.role);
                                }}
                                disabled={updating}
                                className="text-indigo-600 hover:text-indigo-900 font-medium disabled:opacity-50"
                              >
                                Change Role
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={() => handleIncrementReputation(member.wallet)}
                                disabled={updating}
                                className="text-yellow-600 hover:text-yellow-900 font-medium disabled:opacity-50"
                              >
                                +Rep
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Change Role Modal */}
        {selectedMember && isAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Change Member Role</h3>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Member:</p>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                  {selectedMember.slice(0, 8)}...{selectedMember.slice(-8)}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'Admin' | 'Member' | 'Moderator')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="Member">Member</option>
                  <option value="Moderator">Moderator</option>
                  <option value="Admin">Admin</option>
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  {newRole === 'Admin' && 'Full administrative access'}
                  {newRole === 'Moderator' && 'Can moderate content and manage proposals'}
                  {newRole === 'Member' && 'Standard member access'}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedMember(null)}
                  disabled={updating}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateRole(selectedMember)}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Role'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
