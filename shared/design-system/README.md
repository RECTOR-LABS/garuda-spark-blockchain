# Garuda Design System

Shared TailwindCSS component library for KoperasiChain hackathon project.

## Design Principles

### Indonesian Context First
- **Mobile-First**: 80%+ users on mobile devices
- **Touch-Friendly**: 44px minimum touch targets
- **3G Optimized**: Fast loading, minimal animations
- **Bahasa Indonesia**: Natural Indonesian language support

### Visual Identity
- **Colors**:
  - Primary: Purple (#8B5CF6) - Solana brand color
  - Secondary: Emerald (#10B981) - Success, eco-friendly
  - Accent: Amber (#F59E0B) - Highlights, rewards
- **Typography**: Inter (clean, readable on mobile)
- **Shadows**: Subtle, mobile-appropriate
- **Borders**: Rounded (Indonesian design preferences)

### Accessibility
- WCAG 2.1 AA minimum
- Screen reader support
- High contrast mode
- Keyboard navigation

## Components

### Button
```tsx
import { Button } from '@garuda/design-system';

<Button variant="primary" size="lg">
  Connect Wallet
</Button>
```

**Variants**: primary, secondary, outline, ghost, danger
**Sizes**: sm, md, lg, xl

### Input
```tsx
import { Input } from '@garuda/design-system';

<Input
  type="number"
  label="Jumlah Deposit (Rp)"
  placeholder="50000"
/>
```

### WalletButton
```tsx
import { WalletButton } from '@garuda/design-system';

<WalletButton />
```

Pre-configured Solana wallet adapter button with Indonesian labels.

### TransactionStatus
```tsx
import { TransactionStatus } from '@garuda/design-system';

<TransactionStatus
  status="confirming"
  message="Memproses transaksi..."
/>
```

**Statuses**: idle, signing, sending, confirming, confirmed, failed

### LoadingSpinner
```tsx
import { LoadingSpinner } from '@garuda/design-system';

<LoadingSpinner size="lg" text="Memuat data..." />
```

### Toast Notifications
```tsx
import { toast } from '@garuda/design-system';

toast.success('Transaksi berhasil!');
toast.error('Gagal mengirim transaksi');
toast.loading('Menunggu konfirmasi...');
```

### Modal
```tsx
import { Modal } from '@garuda/design-system';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Konfirmasi Voting"
>
  <p>Apakah Anda yakin ingin memilih proposal ini?</p>
</Modal>
```

## Layout Components

### Container
```tsx
<Container maxWidth="lg">
  {/* Content */}
</Container>
```

### Card
```tsx
<Card>
  <CardHeader title="Total Saldo" />
  <CardBody>
    <p className="text-3xl font-bold">Rp 1,250,000</p>
  </CardBody>
  <CardFooter>
    <Button>Tarik Dana</Button>
  </CardFooter>
</Card>
```

## Indonesian Language Strings

```tsx
import { t } from '@garuda/design-system';

{t('wallet.connect')}           // "Hubungkan Wallet"
{t('transaction.pending')}      // "Transaksi sedang diproses..."
{t('error.insufficient_funds')} // "Saldo tidak mencukupi"
```

## Installation

```bash
# From KoperasiChain project directory
cd projects/koperasichain/app
npm install ../../../shared/design-system
```

## Usage in KoperasiChain

```tsx
// tailwind.config.js
import { garudaPreset } from '@garuda/design-system/tailwind';

export default {
  presets: [garudaPreset],
  // ... your config
}

// In components
import { Button, WalletButton } from '@garuda/design-system';
```

## Development

```bash
cd shared/design-system
npm install
npm run dev         # Storybook development
npm run build
npm run test
```

## Maintained By

**Owner**: KoperasiChain Product & Design Team
**Last Updated**: Oct 9, 2025 (Updated for single-project focus)
