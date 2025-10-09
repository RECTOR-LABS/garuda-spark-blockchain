# Shared Solana Utilities

Common Solana helpers for the KoperasiChain project.

## Installation

```bash
# From KoperasiChain project directory
cd projects/koperasichain/app
npm install ../../../shared/solana-utils
```

## Usage

```typescript
import {
  initializeConnection,
  getExplorerLink,
  handleTransactionError
} from '@garuda/solana-utils';
```

## Utilities Included

### 1. Connection Management
- `initializeConnection()` - Create Solana connection with retry logic
- `getWalletBalance()` - Get SOL balance with formatting
- `requestAirdrop()` - Devnet airdrop automation

### 2. Transaction Helpers
- `sendAndConfirmWithRetry()` - Retry logic for failed transactions
- `handleTransactionError()` - User-friendly error messages
- `waitForConfirmation()` - Poll transaction status

### 3. Explorer Links
- `getExplorerLink()` - Generate Solana Explorer URL
- `formatAddress()` - Shorten wallet address (0x1234...5678)

### 4. Error Messages (Indonesian)
- Translate Solana errors to Bahasa Indonesia
- User-friendly messages for common issues

## Example Implementation

```typescript
// wallet-connection.ts
import { initializeConnection } from '@garuda/solana-utils';

const connection = initializeConnection('devnet');

// transaction-handler.ts
import { sendAndConfirmWithRetry } from '@garuda/solana-utils';

const signature = await sendAndConfirmWithRetry(
  connection,
  transaction,
  [wallet],
  { maxRetries: 3 }
);
```

## Development

```bash
cd shared/solana-utils
npm install
npm run build
npm test
```

## Maintained By

**Owner**: KoperasiChain Blockchain Team Lead
**Last Updated**: Oct 9, 2025 (Updated for single-project focus)
