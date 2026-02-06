'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';

/**
 * Client-only wrapper for WalletMultiButton to prevent SSR hydration mismatch.
 * The Solana Wallet Adapter checks for browser wallets, which causes different
 * HTML to be generated on server vs. client.
 */
export function WalletButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render placeholder during SSR and initial hydration
  if (!mounted) {
    return (
      <button className="wallet-adapter-button wallet-adapter-button-trigger" disabled>
        <i className="wallet-adapter-button-start-icon"></i>
        Select Wallet
      </button>
    );
  }

  return <WalletMultiButton />;
}
