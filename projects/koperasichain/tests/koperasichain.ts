import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Koperasichain } from "../target/types/koperasichain";
import { expect } from "chai";

describe("koperasichain", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Koperasichain as Program<Koperasichain>;
  const authority = provider.wallet.publicKey;

  describe("create_cooperative", () => {
    it("Successfully creates a cooperative with valid parameters", async () => {
      const cooperativeName = "Batik Artisans Coop";
      const description = "A cooperative for traditional batik craftspeople in Yogyakarta";
      const votingPeriodDays = 7;
      const quorumPercentage = 60;

      const [cooperativePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("cooperative"),
          authority.toBuffer(),
          Buffer.from(cooperativeName),
        ],
        program.programId
      );

      const tx = await program.methods
        .createCooperative(
          cooperativeName,
          description,
          votingPeriodDays,
          quorumPercentage
        )
        .accounts({
          cooperative: cooperativePda,
          authority: authority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Transaction signature:", tx);

      // Fetch and verify the created cooperative account
      const cooperativeAccount = await program.account.cooperative.fetch(cooperativePda);

      expect(cooperativeAccount.authority.toString()).to.equal(authority.toString());
      expect(cooperativeAccount.name).to.equal(cooperativeName);
      expect(cooperativeAccount.description).to.equal(description);
      expect(cooperativeAccount.memberCount).to.equal(1);
      expect(cooperativeAccount.votingPeriodDays).to.equal(votingPeriodDays);
      expect(cooperativeAccount.quorumPercentage).to.equal(quorumPercentage);
      expect(cooperativeAccount.createdAt.toNumber()).to.be.greaterThan(0);

      console.log("✅ Cooperative created successfully");
      console.log("  Name:", cooperativeAccount.name);
      console.log("  Authority:", cooperativeAccount.authority.toString());
      console.log("  Members:", cooperativeAccount.memberCount);
      console.log("  Created at:", new Date(cooperativeAccount.createdAt.toNumber() * 1000).toISOString());
    });

    it("Fails with name too long (> 50 chars)", async () => {
      const cooperativeName = "A".repeat(51); // 51 characters
      const description = "Test description";

      const [cooperativePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("cooperative"),
          authority.toBuffer(),
          Buffer.from(cooperativeName),
        ],
        program.programId
      );

      try {
        await program.methods
          .createCooperative(cooperativeName, description, 7, 60)
          .accounts({
            cooperative: cooperativePda,
            authority: authority,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();

        expect.fail("Should have thrown error for invalid name");
      } catch (error) {
        expect(error.message).to.include("InvalidName");
        console.log("✅ Correctly rejected name too long");
      }
    });

    it("Fails with empty name", async () => {
      const cooperativeName = "";
      const description = "Test description";

      const [cooperativePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("cooperative"),
          authority.toBuffer(),
          Buffer.from(cooperativeName || "fallback"),
        ],
        program.programId
      );

      try {
        await program.methods
          .createCooperative(cooperativeName, description, 7, 60)
          .accounts({
            cooperative: cooperativePda,
            authority: authority,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();

        expect.fail("Should have thrown error for empty name");
      } catch (error) {
        expect(error.message).to.include("InvalidName");
        console.log("✅ Correctly rejected empty name");
      }
    });

    it("Fails with description too long (> 200 chars)", async () => {
      const cooperativeName = "Test Coop";
      const description = "A".repeat(201); // 201 characters

      const [cooperativePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("cooperative"),
          authority.toBuffer(),
          Buffer.from(cooperativeName),
        ],
        program.programId
      );

      try {
        await program.methods
          .createCooperative(cooperativeName, description, 7, 60)
          .accounts({
            cooperative: cooperativePda,
            authority: authority,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();

        expect.fail("Should have thrown error for invalid description");
      } catch (error) {
        expect(error.message).to.include("InvalidDescription");
        console.log("✅ Correctly rejected description too long");
      }
    });

    it("Fails with invalid voting period (0 days)", async () => {
      const cooperativeName = "Test Coop 2";
      const description = "Test";
      const votingPeriodDays = 0; // Invalid

      const [cooperativePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("cooperative"),
          authority.toBuffer(),
          Buffer.from(cooperativeName),
        ],
        program.programId
      );

      try {
        await program.methods
          .createCooperative(cooperativeName, description, votingPeriodDays, 60)
          .accounts({
            cooperative: cooperativePda,
            authority: authority,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();

        expect.fail("Should have thrown error for invalid voting period");
      } catch (error) {
        expect(error.message).to.include("InvalidVotingPeriod");
        console.log("✅ Correctly rejected voting period = 0");
      }
    });

    it("Fails with invalid voting period (> 30 days)", async () => {
      const cooperativeName = "Test Coop 3";
      const description = "Test";
      const votingPeriodDays = 31; // Invalid

      const [cooperativePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("cooperative"),
          authority.toBuffer(),
          Buffer.from(cooperativeName),
        ],
        program.programId
      );

      try {
        await program.methods
          .createCooperative(cooperativeName, description, votingPeriodDays, 60)
          .accounts({
            cooperative: cooperativePda,
            authority: authority,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();

        expect.fail("Should have thrown error for invalid voting period");
      } catch (error) {
        expect(error.message).to.include("InvalidVotingPeriod");
        console.log("✅ Correctly rejected voting period > 30");
      }
    });

    it("Fails with invalid quorum (0%)", async () => {
      const cooperativeName = "Test Coop 4";
      const description = "Test";
      const quorumPercentage = 0; // Invalid

      const [cooperativePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("cooperative"),
          authority.toBuffer(),
          Buffer.from(cooperativeName),
        ],
        program.programId
      );

      try {
        await program.methods
          .createCooperative(cooperativeName, description, 7, quorumPercentage)
          .accounts({
            cooperative: cooperativePda,
            authority: authority,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();

        expect.fail("Should have thrown error for invalid quorum");
      } catch (error) {
        expect(error.message).to.include("InvalidQuorum");
        console.log("✅ Correctly rejected quorum = 0");
      }
    });

    it("Fails with invalid quorum (> 100%)", async () => {
      const cooperativeName = "Test Coop 5";
      const description = "Test";
      const quorumPercentage = 101; // Invalid

      const [cooperativePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("cooperative"),
          authority.toBuffer(),
          Buffer.from(cooperativeName),
        ],
        program.programId
      );

      try {
        await program.methods
          .createCooperative(cooperativeName, description, 7, quorumPercentage)
          .accounts({
            cooperative: cooperativePda,
            authority: authority,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();

        expect.fail("Should have thrown error for invalid quorum");
      } catch (error) {
        expect(error.message).to.include("InvalidQuorum");
        console.log("✅ Correctly rejected quorum > 100");
      }
    });

    it("Allows multiple cooperatives from same authority", async () => {
      const coop1Name = "Furniture Makers";
      const coop2Name = "Woodworkers Union";

      const [coop1Pda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("cooperative"), authority.toBuffer(), Buffer.from(coop1Name)],
        program.programId
      );

      const [coop2Pda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("cooperative"), authority.toBuffer(), Buffer.from(coop2Name)],
        program.programId
      );

      // Create first cooperative
      await program.methods
        .createCooperative(coop1Name, "Furniture cooperative", 7, 50)
        .accounts({
          cooperative: coop1Pda,
          authority: authority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Create second cooperative
      await program.methods
        .createCooperative(coop2Name, "Woodworking cooperative", 14, 75)
        .accounts({
          cooperative: coop2Pda,
          authority: authority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const coop1Account = await program.account.cooperative.fetch(coop1Pda);
      const coop2Account = await program.account.cooperative.fetch(coop2Pda);

      expect(coop1Account.name).to.equal(coop1Name);
      expect(coop2Account.name).to.equal(coop2Name);
      expect(coop1Account.quorumPercentage).to.equal(50);
      expect(coop2Account.quorumPercentage).to.equal(75);

      console.log("✅ Multiple cooperatives from same authority created successfully");
    });
  });

  describe("add_member", () => {
    let testCooperativePda: anchor.web3.PublicKey;
    const testCooperativeName = "Member Test Coop";

    // Create a cooperative before running member tests
    before(async () => {
      [testCooperativePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("cooperative"),
          authority.toBuffer(),
          Buffer.from(testCooperativeName),
        ],
        program.programId
      );

      await program.methods
        .createCooperative(
          testCooperativeName,
          "A cooperative for testing member functionality",
          7,
          60
        )
        .accounts({
          cooperative: testCooperativePda,
          authority: authority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Test cooperative created for member tests");
    });

    it("Successfully adds a member to cooperative", async () => {
      const newMemberWallet = anchor.web3.Keypair.generate();

      const [memberPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("member"),
          testCooperativePda.toBuffer(),
          newMemberWallet.publicKey.toBuffer(),
        ],
        program.programId
      );

      const coopBefore = await program.account.cooperative.fetch(testCooperativePda);
      const memberCountBefore = coopBefore.memberCount;

      const tx = await program.methods
        .addMember()
        .accounts({
          cooperative: testCooperativePda,
          member: memberPda,
          memberWallet: newMemberWallet.publicKey,
          authority: authority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Add member transaction signature:", tx);

      // Verify member account created
      const memberAccount = await program.account.member.fetch(memberPda);
      expect(memberAccount.cooperative.toString()).to.equal(testCooperativePda.toString());
      expect(memberAccount.wallet.toString()).to.equal(newMemberWallet.publicKey.toString());
      expect(memberAccount.isActive).to.equal(true);
      expect(memberAccount.joinedAt.toNumber()).to.be.greaterThan(0);

      // Verify member count incremented
      const coopAfter = await program.account.cooperative.fetch(testCooperativePda);
      expect(coopAfter.memberCount).to.equal(memberCountBefore + 1);

      console.log("✅ Member added successfully");
      console.log("  Member wallet:", memberAccount.wallet.toString());
      console.log("  Joined at:", new Date(memberAccount.joinedAt.toNumber() * 1000).toISOString());
      console.log("  Total members:", coopAfter.memberCount);
    });

    it("Successfully adds multiple members", async () => {
      const member1 = anchor.web3.Keypair.generate();
      const member2 = anchor.web3.Keypair.generate();
      const member3 = anchor.web3.Keypair.generate();

      const [memberPda1] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("member"), testCooperativePda.toBuffer(), member1.publicKey.toBuffer()],
        program.programId
      );

      const [memberPda2] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("member"), testCooperativePda.toBuffer(), member2.publicKey.toBuffer()],
        program.programId
      );

      const [memberPda3] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("member"), testCooperativePda.toBuffer(), member3.publicKey.toBuffer()],
        program.programId
      );

      const coopBefore = await program.account.cooperative.fetch(testCooperativePda);
      const memberCountBefore = coopBefore.memberCount;

      // Add three members
      await program.methods
        .addMember()
        .accounts({
          cooperative: testCooperativePda,
          member: memberPda1,
          memberWallet: member1.publicKey,
          authority: authority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      await program.methods
        .addMember()
        .accounts({
          cooperative: testCooperativePda,
          member: memberPda2,
          memberWallet: member2.publicKey,
          authority: authority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      await program.methods
        .addMember()
        .accounts({
          cooperative: testCooperativePda,
          member: memberPda3,
          memberWallet: member3.publicKey,
          authority: authority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Verify all members exist
      const memberAccount1 = await program.account.member.fetch(memberPda1);
      const memberAccount2 = await program.account.member.fetch(memberPda2);
      const memberAccount3 = await program.account.member.fetch(memberPda3);

      expect(memberAccount1.isActive).to.equal(true);
      expect(memberAccount2.isActive).to.equal(true);
      expect(memberAccount3.isActive).to.equal(true);

      // Verify member count
      const coopAfter = await program.account.cooperative.fetch(testCooperativePda);
      expect(coopAfter.memberCount).to.equal(memberCountBefore + 3);

      console.log("✅ Multiple members added successfully");
      console.log("  Total members:", coopAfter.memberCount);
    });

    it("Fails when non-authority tries to add member", async () => {
      const unauthorizedUser = anchor.web3.Keypair.generate();
      const newMember = anchor.web3.Keypair.generate();

      // Airdrop SOL to unauthorized user for transaction fees
      const airdropSig = await provider.connection.requestAirdrop(
        unauthorizedUser.publicKey,
        1 * anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSig);

      const [memberPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("member"), testCooperativePda.toBuffer(), newMember.publicKey.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .addMember()
          .accounts({
            cooperative: testCooperativePda,
            member: memberPda,
            memberWallet: newMember.publicKey,
            authority: unauthorizedUser.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([unauthorizedUser])
          .rpc();

        expect.fail("Should have thrown error for unauthorized user");
      } catch (error) {
        expect(error.message).to.include("Unauthorized");
        console.log("✅ Correctly rejected unauthorized add_member");
      }
    });

    it("Fails when trying to add duplicate member", async () => {
      const duplicateMember = anchor.web3.Keypair.generate();

      const [memberPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("member"), testCooperativePda.toBuffer(), duplicateMember.publicKey.toBuffer()],
        program.programId
      );

      // Add member first time
      await program.methods
        .addMember()
        .accounts({
          cooperative: testCooperativePda,
          member: memberPda,
          memberWallet: duplicateMember.publicKey,
          authority: authority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Try to add same member again
      try {
        await program.methods
          .addMember()
          .accounts({
            cooperative: testCooperativePda,
            member: memberPda,
            memberWallet: duplicateMember.publicKey,
            authority: authority,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();

        expect.fail("Should have thrown error for duplicate member");
      } catch (error) {
        // Solana will throw "account already in use" error
        expect(error.message).to.include("already in use");
        console.log("✅ Correctly rejected duplicate member");
      }
    });
  });
});
