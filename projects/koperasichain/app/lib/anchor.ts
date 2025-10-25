import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import idl from './idl.json';

const PROGRAM_ID = new PublicKey('4GVcmbRKrGWLR1fSttYYtgCmbbLSViLcYUpHvq4cwWZQ');

export function getProgram(wallet: AnchorWallet, connection: Connection) {
  const provider = new AnchorProvider(
    connection,
    wallet,
    { commitment: 'confirmed' }
  );

  return new Program(idl as Idl, PROGRAM_ID, provider);
}

export async function getCooperativePDA(
  authority: PublicKey,
  name: string,
  programId: PublicKey = PROGRAM_ID
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('cooperative'),
      authority.toBuffer(),
      Buffer.from(name),
    ],
    programId
  );
}

export async function getMemberPDA(
  cooperativeAddress: PublicKey,
  memberWallet: PublicKey,
  programId: PublicKey = PROGRAM_ID
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('member'),
      cooperativeAddress.toBuffer(),
      memberWallet.toBuffer(),
    ],
    programId
  );
}

export async function getProposalPDA(
  cooperativeAddress: PublicKey,
  title: string,
  programId: PublicKey = PROGRAM_ID
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('proposal'),
      cooperativeAddress.toBuffer(),
      Buffer.from(title),
    ],
    programId
  );
}

export async function getVotePDA(
  proposalAddress: PublicKey,
  voterWallet: PublicKey,
  programId: PublicKey = PROGRAM_ID
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('vote'),
      proposalAddress.toBuffer(),
      voterWallet.toBuffer(),
    ],
    programId
  );
}
