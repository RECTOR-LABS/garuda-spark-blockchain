'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram } from '@solana/web3.js';
import { getProgram, getCooperativePDA } from '@/lib/anchor';
import { WalletButton } from '@/app/components/wallet/WalletButton';

export default function Home() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    votingPeriodDays: 7,
    quorumPercentage: 60,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ signature: string; pda: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet.publicKey || !wallet.signTransaction) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      const program = getProgram(wallet as any, connection);

      const [cooperativePda] = await getCooperativePDA(
        wallet.publicKey,
        formData.name
      );

      const tx = await program.methods
        .createCooperative(
          formData.name,
          formData.description,
          formData.votingPeriodDays,
          formData.quorumPercentage
        )
        .accounts({
          cooperative: cooperativePda,
          authority: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setSuccess({
        signature: tx,
        pda: cooperativePda.toBase58()
      });

      setFormData({
        name: '',
        description: '',
        votingPeriodDays: 7,
        quorumPercentage: 60,
      });

    } catch (err: any) {
      console.error('Error creating cooperative:', err);
      setError(err.message || 'Failed to create cooperative');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">KoperasiChain</h1>
              <span className="ml-3 px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full">
                Devnet
              </span>
            </div>
            <WalletButton />
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!wallet.connected ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to KoperasiChain
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create and manage digital cooperatives on Solana blockchain.
              Connect your wallet to get started.
            </p>
            <WalletButton className="!bg-indigo-600 hover:!bg-indigo-700" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Cooperative
            </h2>
            <p className="text-gray-600 mb-8">
              Start your digital cooperative with transparent governance
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-green-800 mb-3">
                      Cooperative Created Successfully!
                    </h3>
                    <div className="text-sm text-green-700 space-y-2">
                      <p className="font-mono text-xs break-all">
                        <span className="font-semibold">Account:</span> {success.pda}
                      </p>
                      <a
                        href={`https://explorer.solana.com/tx/${success.signature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-green-600 hover:text-green-800 font-medium"
                      >
                        View on Solana Explorer
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>

                      <div className="mt-4 pt-4 border-t border-green-200">
                        <p className="font-semibold text-green-800 mb-2">Invite Members:</p>
                        <div className="flex items-center gap-2 p-2 bg-white rounded border border-green-300">
                          <input
                            type="text"
                            readOnly
                            value={`${window.location.origin}/join?coop=${success.pda}`}
                            className="flex-1 text-xs font-mono text-gray-700 bg-transparent border-none focus:outline-none"
                            onClick={(e) => e.currentTarget.select()}
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/join?coop=${success.pda}`);
                              alert('Invite link copied to clipboard!');
                            }}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors"
                          >
                            Copy
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            const inviteLink = `${window.location.origin}/join?coop=${success.pda}`;
                            const message = `Join our cooperative on KoperasiChain! ${inviteLink}`;
                            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                            window.open(whatsappUrl, '_blank');
                          }}
                          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          Share via WhatsApp
                        </button>

                        <a
                          href={`/dashboard/${success.pda}`}
                          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                          View Dashboard
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cooperative Name *
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Batik Artisans Cooperative"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.name.length}/50 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  maxLength={200}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Describe your cooperative's mission and activities..."
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.description.length}/200 characters
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voting Period (days) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={30}
                    value={formData.votingPeriodDays}
                    onChange={(e) => setFormData({ ...formData, votingPeriodDays: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Between 1-30 days
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quorum (%) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={formData.quorumPercentage}
                    onChange={(e) => setFormData({ ...formData, quorumPercentage: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Minimum % required to vote
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Cooperative...
                  </>
                ) : (
                  'Create Cooperative'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Connected wallet: <span className="ml-2 font-mono text-xs">{wallet.publicKey?.toBase58().slice(0, 8)}...{wallet.publicKey?.toBase58().slice(-8)}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
