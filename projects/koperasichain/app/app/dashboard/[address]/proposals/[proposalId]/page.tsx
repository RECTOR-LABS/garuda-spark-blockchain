'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { SystemProgram, PublicKey } from '@solana/web3.js';
import { getProgram, getMemberPDA, getVotePDA } from '@/lib/anchor';
import Link from 'next/link';

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

export default function ProposalDetailPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const params = useParams();
  const cooperativeAddress = params.address as string;
  const proposalId = params.proposalId as string;

  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [cooperative, setCooperative] = useState<any>(null);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');

  const fetchData = async () => {
    if (!proposalId || !cooperativeAddress) {
      setError('Invalid proposal or cooperative address');
      setLoading(false);
      return;
    }

    try {
      const program = getProgram(wallet as any, connection);
      const proposalPubkey = new PublicKey(proposalId);
      const coopPubkey = new PublicKey(cooperativeAddress);

      // Fetch proposal data
      const proposalAccount = await program.account.proposal.fetch(proposalPubkey);

      const proposalData: ProposalData = {
        address: proposalId,
        cooperative: proposalAccount.cooperative.toBase58(),
        proposer: proposalAccount.proposer.toBase58(),
        title: proposalAccount.title,
        description: proposalAccount.description,
        proposalType: Object.keys(proposalAccount.proposalType)[0],
        yesVotes: proposalAccount.yesVotes,
        noVotes: proposalAccount.noVotes,
        abstainVotes: proposalAccount.abstainVotes,
        status: Object.keys(proposalAccount.status)[0],
        createdAt: proposalAccount.createdAt.toNumber(),
        endsAt: proposalAccount.endsAt.toNumber(),
      };

      setProposal(proposalData);

      // Fetch cooperative data
      const coopAccount = await program.account.cooperative.fetch(coopPubkey);
      setCooperative({
        address: cooperativeAddress,
        name: coopAccount.name,
        memberCount: coopAccount.memberCount,
        quorumPercentage: coopAccount.quorumPercentage,
        authority: coopAccount.authority.toBase58(),
        ...coopAccount,
      });

      // Check if current wallet is the admin (authority)
      if (wallet.publicKey) {
        setIsAdmin(coopAccount.authority.toBase58() === wallet.publicKey.toBase58());
      }

      // Check if current wallet is a member and if they've voted
      if (wallet.publicKey) {
        try {
          const [memberPda] = await getMemberPDA(coopPubkey, wallet.publicKey);
          const memberAccount = await program.account.member.fetch(memberPda);
          setIsMember(memberAccount.isActive);

          // Check if user has already voted
          const [votePda] = await getVotePDA(proposalPubkey, wallet.publicKey);
          try {
            const voteAccount = await program.account.vote.fetch(votePda);
            setHasVoted(true);
            setUserVote(Object.keys(voteAccount.voteChoice)[0]);
          } catch {
            setHasVoted(false);
          }
        } catch {
          setIsMember(false);
        }
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching proposal:', err);
      setError('Failed to load proposal');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [proposalId, cooperativeAddress, connection, wallet.publicKey]);

  // Countdown timer effect
  useEffect(() => {
    if (!proposal) return;

    const updateCountdown = () => {
      const now = Date.now() / 1000;
      const secondsRemaining = proposal.endsAt - now;

      if (secondsRemaining <= 0) {
        setTimeRemaining('Voting ended');
        return;
      }

      const days = Math.floor(secondsRemaining / 86400);
      const hours = Math.floor((secondsRemaining % 86400) / 3600);
      const minutes = Math.floor((secondsRemaining % 3600) / 60);
      const seconds = Math.floor(secondsRemaining % 60);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m remaining`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s remaining`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s remaining`);
      } else {
        setTimeRemaining(`${seconds}s remaining`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [proposal]);

  const handleVote = async (voteChoice: 'Yes' | 'No' | 'Abstain') => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setError('Please connect your wallet first');
      return;
    }

    if (!isMember) {
      setError('Only active members can vote');
      return;
    }

    if (hasVoted) {
      setError('You have already voted on this proposal');
      return;
    }

    setVoting(true);
    setError('');
    setSuccess('');

    try {
      const program = getProgram(wallet as any, connection);
      const proposalPubkey = new PublicKey(proposalId);
      const coopPubkey = new PublicKey(cooperativeAddress);

      const [memberPda] = await getMemberPDA(coopPubkey, wallet.publicKey);
      const [votePda] = await getVotePDA(proposalPubkey, wallet.publicKey);

      // Map vote choice to enum
      const voteChoiceEnum = { [voteChoice.toLowerCase()]: {} };

      const tx = await program.methods
        .castVote(voteChoiceEnum)
        .accounts({
          proposal: proposalPubkey,
          cooperative: coopPubkey,
          member: memberPda,
          vote: votePda,
          voter: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setSuccess(`Vote cast successfully! Transaction: ${tx}`);
      setHasVoted(true);
      setUserVote(voteChoice);

      // Refresh proposal data
      setTimeout(() => {
        fetchData();
      }, 1000);
    } catch (err: any) {
      console.error('Error casting vote:', err);
      setError(err.message || 'Failed to cast vote');
    } finally {
      setVoting(false);
    }
  };

  const handleExecute = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setError('Please connect your wallet first');
      return;
    }

    if (!isAdmin) {
      setError('Only the cooperative admin can execute proposals');
      return;
    }

    if (proposal?.status.toLowerCase() !== 'passed') {
      setError('Only passed proposals can be executed');
      return;
    }

    const now = Date.now() / 1000;
    if (proposal && now <= proposal.endsAt) {
      setError('Cannot execute proposal before voting period ends');
      return;
    }

    setExecuting(true);
    setError('');
    setSuccess('');

    try {
      const program = getProgram(wallet as any, connection);
      const proposalPubkey = new PublicKey(proposalId);
      const coopPubkey = new PublicKey(cooperativeAddress);

      const tx = await program.methods
        .executeProposal()
        .accounts({
          proposal: proposalPubkey,
          cooperative: coopPubkey,
          authority: wallet.publicKey,
        })
        .rpc();

      setSuccess(`Proposal executed successfully! Transaction: ${tx}`);

      // Refresh proposal data
      setTimeout(() => {
        fetchData();
      }, 1000);
    } catch (err: any) {
      console.error('Error executing proposal:', err);
      setError(err.message || 'Failed to execute proposal');
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (error && !proposal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Proposal</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link
            href={`/dashboard/${cooperativeAddress}/proposals`}
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Proposals
          </Link>
        </div>
      </div>
    );
  }

  if (!proposal || !cooperative) return null;

  const totalVotes = proposal.yesVotes + proposal.noVotes + proposal.abstainVotes;
  const yesPercentage = totalVotes > 0 ? (proposal.yesVotes / totalVotes) * 100 : 0;
  const noPercentage = totalVotes > 0 ? (proposal.noVotes / totalVotes) * 100 : 0;
  const abstainPercentage = totalVotes > 0 ? (proposal.abstainVotes / totalVotes) * 100 : 0;
  const votePercentage = (totalVotes * 100) / cooperative.memberCount;
  const isQuorumReached = votePercentage >= cooperative.quorumPercentage;
  const now = Date.now() / 1000;
  const isVotingActive = proposal.status.toLowerCase() === 'active' && now <= proposal.endsAt;

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href={`/dashboard/${cooperativeAddress}`} className="hover:text-indigo-600">
            {cooperative.name}
          </Link>
          <span>/</span>
          <Link href={`/dashboard/${cooperativeAddress}/proposals`} className="hover:text-indigo-600">
            Proposals
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Details</span>
        </div>

        {/* Proposal Header */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(proposal.status)}`}>
                  {proposal.status}
                </span>
                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                  {formatProposalType(proposal.proposalType)}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{proposal.title}</h1>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{proposal.description}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Proposed by:</span>
              <p className="font-mono text-gray-900 mt-1">{proposal.proposer.slice(0, 8)}...{proposal.proposer.slice(-8)}</p>
            </div>
            <div>
              <span className="text-gray-500">Created:</span>
              <p className="text-gray-900 mt-1">{new Date(proposal.createdAt * 1000).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-500">Voting ends:</span>
              <p className="text-gray-900 mt-1">{new Date(proposal.endsAt * 1000).toLocaleDateString()}</p>
              {isVotingActive && timeRemaining && (
                <p className="text-sm font-semibold text-indigo-600 mt-1">⏱️ {timeRemaining}</p>
              )}
            </div>
          </div>
        </div>

        {/* Vote Tallies */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Vote Tallies</h2>

          {/* Quorum Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Participation</span>
              <span className={`text-sm font-semibold ${isQuorumReached ? 'text-green-700' : 'text-gray-700'}`}>
                {totalVotes} / {cooperative.memberCount} members ({votePercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${isQuorumReached ? 'bg-green-500' : 'bg-gray-400'}`}
                style={{ width: `${Math.min(votePercentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Quorum required: {cooperative.quorumPercentage}% {isQuorumReached && '✓ Reached'}
            </p>
          </div>

          {/* Vote Breakdown */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700">Yes</span>
                <span className="text-sm font-semibold text-green-700">{proposal.yesVotes} ({yesPercentage.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${yesPercentage}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-700">No</span>
                <span className="text-sm font-semibold text-red-700">{proposal.noVotes} ({noPercentage.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full transition-all"
                  style={{ width: `${noPercentage}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Abstain</span>
                <span className="text-sm font-semibold text-gray-700">{proposal.abstainVotes} ({abstainPercentage.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gray-400 h-3 rounded-full transition-all"
                  style={{ width: `${abstainPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Voting Actions */}
        {wallet.connected && isMember && isVotingActive && !hasVoted && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cast Your Vote</h2>
            <p className="text-gray-600 mb-6">Choose your vote carefully. You can only vote once per proposal.</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleVote('Yes')}
                disabled={voting}
                className="flex flex-col items-center justify-center p-6 border-2 border-green-300 hover:border-green-500 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-12 h-12 text-green-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-lg font-bold text-green-700">Vote Yes</span>
                <span className="text-sm text-gray-600 mt-1">Support this proposal</span>
              </button>

              <button
                onClick={() => handleVote('No')}
                disabled={voting}
                className="flex flex-col items-center justify-center p-6 border-2 border-red-300 hover:border-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-12 h-12 text-red-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-lg font-bold text-red-700">Vote No</span>
                <span className="text-sm text-gray-600 mt-1">Oppose this proposal</span>
              </button>

              <button
                onClick={() => handleVote('Abstain')}
                disabled={voting}
                className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 hover:border-gray-500 hover:bg-gray-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-12 h-12 text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                <span className="text-lg font-bold text-gray-700">Abstain</span>
                <span className="text-sm text-gray-600 mt-1">Neither support nor oppose</span>
              </button>
            </div>
          </div>
        )}

        {/* Already Voted */}
        {hasVoted && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">You've Already Voted</h3>
              <p className="text-gray-600">
                Your vote: <span className="font-semibold">{userVote}</span>
              </p>
            </div>
          </div>
        )}

        {/* Not a member / Not connected */}
        {(!wallet.connected || !isMember) && isVotingActive && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {!wallet.connected ? 'Connect Wallet to Vote' : 'Members Only'}
              </h3>
              <p className="text-gray-600 mb-6">
                {!wallet.connected
                  ? 'Connect your wallet to participate in voting'
                  : 'Only active cooperative members can vote on proposals'}
              </p>
              {!wallet.connected && <WalletMultiButton />}
            </div>
          </div>
        )}

        {/* Voting Ended */}
        {!isVotingActive && proposal.status.toLowerCase() !== 'active' && proposal.status.toLowerCase() !== 'passed' && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Voting Has Ended</h3>
              <p className="text-gray-600">
                This proposal ended on {new Date(proposal.endsAt * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Execute Proposal (Admin Only) */}
        {isAdmin && proposal.status.toLowerCase() === 'passed' && !isVotingActive && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Proposal Passed!</h3>
              <p className="text-gray-600 mb-6">
                This proposal has been approved by the members. As the admin, you can now execute it.
              </p>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 break-all">{success}</p>
                </div>
              )}

              <button
                onClick={handleExecute}
                disabled={executing}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                {executing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Executing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    Execute Proposal
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Proposal Executed */}
        {proposal.status.toLowerCase() === 'executed' && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Proposal Executed</h3>
              <p className="text-gray-600">
                This proposal has been successfully executed by the cooperative admin.
              </p>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-6">
          <Link
            href={`/dashboard/${cooperativeAddress}/proposals`}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Proposals
          </Link>
        </div>
      </main>
    </div>
  );
}
