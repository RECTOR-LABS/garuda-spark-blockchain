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

  describe("Voting System (Epic 2)", () => {
    let votingCooperativePda: anchor.web3.PublicKey;
    const votingCooperativeName = "Voting Test Coop";
    let member1: anchor.web3.Keypair;
    let member2: anchor.web3.Keypair;
    let member3: anchor.web3.Keypair;
    let member1Pda: anchor.web3.PublicKey;
    let member2Pda: anchor.web3.PublicKey;
    let member3Pda: anchor.web3.PublicKey;

    // Create a cooperative and add members before voting tests
    before(async () => {
      [votingCooperativePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("cooperative"),
          authority.toBuffer(),
          Buffer.from(votingCooperativeName),
        ],
        program.programId
      );

      // Create cooperative with 60% quorum and 7-day voting period
      await program.methods
        .createCooperative(votingCooperativeName, "Test voting functionality", 7, 60)
        .accounts({
          cooperative: votingCooperativePda,
          authority: authority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Create 3 members for voting
      member1 = anchor.web3.Keypair.generate();
      member2 = anchor.web3.Keypair.generate();
      member3 = anchor.web3.Keypair.generate();

      // Airdrop SOL to members for transaction fees
      await provider.connection.requestAirdrop(member1.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL);
      await provider.connection.requestAirdrop(member2.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL);
      await provider.connection.requestAirdrop(member3.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL);

      // Wait for airdrops
      await new Promise((resolve) => setTimeout(resolve, 1000));

      [member1Pda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("member"), votingCooperativePda.toBuffer(), member1.publicKey.toBuffer()],
        program.programId
      );

      [member2Pda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("member"), votingCooperativePda.toBuffer(), member2.publicKey.toBuffer()],
        program.programId
      );

      [member3Pda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("member"), votingCooperativePda.toBuffer(), member3.publicKey.toBuffer()],
        program.programId
      );

      // Add members
      await program.methods
        .addMember()
        .accounts({
          cooperative: votingCooperativePda,
          member: member1Pda,
          memberWallet: member1.publicKey,
          authority: authority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      await program.methods
        .addMember()
        .accounts({
          cooperative: votingCooperativePda,
          member: member2Pda,
          memberWallet: member2.publicKey,
          authority: authority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      await program.methods
        .addMember()
        .accounts({
          cooperative: votingCooperativePda,
          member: member3Pda,
          memberWallet: member3.publicKey,
          authority: authority,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("✅ Voting test cooperative created with 4 members (authority + 3 members)");
    });

    describe("create_proposal", () => {
      it("Successfully creates a proposal", async () => {
        const proposalTitle = "Purchase New Equipment";
        const proposalDescription = "Proposal to allocate 100 SOL for new batik equipment";

        const [proposalPda] = anchor.web3.PublicKey.findProgramAddressSync(
          [
            Buffer.from("proposal"),
            votingCooperativePda.toBuffer(),
            Buffer.from(proposalTitle),
          ],
          program.programId
        );

        // Authority creates proposal (they're automatically a member)
        const [authorityMemberPda] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("member"), votingCooperativePda.toBuffer(), authority.toBuffer()],
          program.programId
        );

        const tx = await program.methods
          .createProposal(
            proposalTitle,
            proposalDescription,
            { fundAllocation: {} } // ProposalType::FundAllocation
          )
          .accounts({
            proposal: proposalPda,
            cooperative: votingCooperativePda,
            member: authorityMemberPda,
            proposer: authority,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();

        console.log("Create proposal transaction:", tx);

        // Verify proposal created correctly
        const proposalAccount = await program.account.proposal.fetch(proposalPda);
        expect(proposalAccount.title).to.equal(proposalTitle);
        expect(proposalAccount.description).to.equal(proposalDescription);
        expect(proposalAccount.proposer.toString()).to.equal(authority.toString());
        expect(proposalAccount.cooperative.toString()).to.equal(votingCooperativePda.toString());
        expect(proposalAccount.yesVotes).to.equal(0);
        expect(proposalAccount.noVotes).to.equal(0);
        expect(proposalAccount.abstainVotes).to.equal(0);

        console.log("✅ Proposal created successfully");
        console.log("  Title:", proposalAccount.title);
        console.log("  Status:", proposalAccount.status);
        console.log("  Ends at:", new Date(proposalAccount.endsAt.toNumber() * 1000).toISOString());
      });

      it("Fails with title too long (> 100 chars)", async () => {
        const longTitle = "A".repeat(101);

        const [proposalPda] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("proposal"), votingCooperativePda.toBuffer(), Buffer.from(longTitle)],
          program.programId
        );

        const [authorityMemberPda] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("member"), votingCooperativePda.toBuffer(), authority.toBuffer()],
          program.programId
        );

        try {
          await program.methods
            .createProposal(longTitle, "Test description", { textProposal: {} })
            .accounts({
              proposal: proposalPda,
              cooperative: votingCooperativePda,
              member: authorityMemberPda,
              proposer: authority,
              systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();

          expect.fail("Should have thrown error for title too long");
        } catch (error) {
          expect(error.message).to.include("InvalidProposalTitle");
          console.log("✅ Correctly rejected title too long");
        }
      });

      it("Fails when non-member tries to create proposal", async () => {
        const nonMember = anchor.web3.Keypair.generate();

        // Airdrop SOL
        await provider.connection.requestAirdrop(nonMember.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const [proposalPda] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("proposal"), votingCooperativePda.toBuffer(), Buffer.from("Test Proposal")],
          program.programId
        );

        // Try to use a fake member PDA (will fail validation)
        const [fakeMemberPda] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("member"), votingCooperativePda.toBuffer(), nonMember.publicKey.toBuffer()],
          program.programId
        );

        try {
          await program.methods
            .createProposal("Test Proposal", "Test", { textProposal: {} })
            .accounts({
              proposal: proposalPda,
              cooperative: votingCooperativePda,
              member: fakeMemberPda,
              proposer: nonMember.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([nonMember])
            .rpc();

          expect.fail("Should have thrown error for non-member");
        } catch (error) {
          // Will fail because member account doesn't exist
          expect(error.message).to.include("AccountNotInitialized");
          console.log("✅ Correctly rejected non-member creating proposal");
        }
      });
    });

    describe("cast_vote", () => {
      let testProposalPda: anchor.web3.PublicKey;
      const testProposalTitle = "Vote Test Proposal";

      // Create a proposal before vote tests
      before(async () => {
        [testProposalPda] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("proposal"), votingCooperativePda.toBuffer(), Buffer.from(testProposalTitle)],
          program.programId
        );

        const [authorityMemberPda] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("member"), votingCooperativePda.toBuffer(), authority.toBuffer()],
          program.programId
        );

        await program.methods
          .createProposal(testProposalTitle, "Test proposal for voting", { textProposal: {} })
          .accounts({
            proposal: testProposalPda,
            cooperative: votingCooperativePda,
            member: authorityMemberPda,
            proposer: authority,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();

        console.log("✅ Test proposal created for voting tests");
      });

      it("Successfully casts a YES vote", async () => {
        const [votePda] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("vote"), testProposalPda.toBuffer(), member1.publicKey.toBuffer()],
          program.programId
        );

        const tx = await program.methods
          .castVote({ yes: {} }) // VoteChoice::Yes
          .accounts({
            proposal: testProposalPda,
            cooperative: votingCooperativePda,
            member: member1Pda,
            vote: votePda,
            voter: member1.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([member1])
          .rpc();

        console.log("Vote transaction:", tx);

        // Verify vote recorded
        const voteAccount = await program.account.vote.fetch(votePda);
        expect(voteAccount.voter.toString()).to.equal(member1.publicKey.toString());
        // Check voteChoice.yes exists (Anchor enum representation)

        // Verify proposal tally updated
        const proposalAccount = await program.account.proposal.fetch(testProposalPda);
        expect(proposalAccount.yesVotes).to.equal(1);

        console.log("✅ YES vote cast successfully");
      });

      it("Successfully casts a NO vote", async () => {
        const [votePda] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("vote"), testProposalPda.toBuffer(), member2.publicKey.toBuffer()],
          program.programId
        );

        await program.methods
          .castVote({ no: {} }) // VoteChoice::No
          .accounts({
            proposal: testProposalPda,
            cooperative: votingCooperativePda,
            member: member2Pda,
            vote: votePda,
            voter: member2.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([member2])
          .rpc();

        const proposalAccount = await program.account.proposal.fetch(testProposalPda);
        expect(proposalAccount.noVotes).to.equal(1);

        console.log("✅ NO vote cast successfully");
      });

      it("Prevents duplicate voting", async () => {
        const [votePda] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("vote"), testProposalPda.toBuffer(), member1.publicKey.toBuffer()],
          program.programId
        );

        try {
          await program.methods
            .castVote({ yes: {} })
            .accounts({
              proposal: testProposalPda,
              cooperative: votingCooperativePda,
              member: member1Pda,
              vote: votePda,
              voter: member1.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([member1])
            .rpc();

          expect.fail("Should have thrown error for duplicate vote");
        } catch (error) {
          expect(error.message).to.include("already in use");
          console.log("✅ Correctly prevented duplicate vote");
        }
      });

      it("Reaches quorum and marks proposal as Passed", async () => {
        // We have 4 members total (authority + 3 members)
        // Quorum is 60%, so we need 2.4 => 3 votes minimum
        // Currently: 1 YES, 1 NO (2 votes total)
        // Need one more vote to reach quorum

        const [votePda] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("vote"), testProposalPda.toBuffer(), member3.publicKey.toBuffer()],
          program.programId
        );

        await program.methods
          .castVote({ yes: {} })
          .accounts({
            proposal: testProposalPda,
            cooperative: votingCooperativePda,
            member: member3Pda,
            vote: votePda,
            voter: member3.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([member3])
          .rpc();

        const proposalAccount = await program.account.proposal.fetch(testProposalPda);
        expect(proposalAccount.yesVotes).to.equal(2);
        expect(proposalAccount.noVotes).to.equal(1);

        // Check if status changed to Passed (2 YES > 1 NO, and quorum reached)
        // Total votes: 3, Total members: 4, Percentage: 75% >= 60% quorum
        // YES (2) > NO (1), so should be Passed
        expect(proposalAccount.status).to.deep.equal({ passed: {} });

        console.log("✅ Quorum reached and proposal marked as Passed");
      });
    });

    describe("execute_proposal", () => {
      let executableProposalPda: anchor.web3.PublicKey;
      const executableProposalTitle = "Executable Proposal";

      // Create and pass a proposal for execution tests
      before(async () => {
        [executableProposalPda] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("proposal"), votingCooperativePda.toBuffer(), Buffer.from(executableProposalTitle)],
          program.programId
        );

        const [authorityMemberPda] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("member"), votingCooperativePda.toBuffer(), authority.toBuffer()],
          program.programId
        );

        // Create proposal
        await program.methods
          .createProposal(executableProposalTitle, "Test execution", { fundAllocation: {} })
          .accounts({
            proposal: executableProposalPda,
            cooperative: votingCooperativePda,
            member: authorityMemberPda,
            proposer: authority,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();

        // Cast votes to reach quorum and pass (need 3 votes, all YES)
        const [vote1Pda] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("vote"), executableProposalPda.toBuffer(), member1.publicKey.toBuffer()],
          program.programId
        );

        const [vote2Pda] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("vote"), executableProposalPda.toBuffer(), member2.publicKey.toBuffer()],
          program.programId
        );

        const [vote3Pda] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("vote"), executableProposalPda.toBuffer(), member3.publicKey.toBuffer()],
          program.programId
        );

        await program.methods
          .castVote({ yes: {} })
          .accounts({
            proposal: executableProposalPda,
            cooperative: votingCooperativePda,
            member: member1Pda,
            vote: vote1Pda,
            voter: member1.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([member1])
          .rpc();

        await program.methods
          .castVote({ yes: {} })
          .accounts({
            proposal: executableProposalPda,
            cooperative: votingCooperativePda,
            member: member2Pda,
            vote: vote2Pda,
            voter: member2.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([member2])
          .rpc();

        await program.methods
          .castVote({ yes: {} })
          .accounts({
            proposal: executableProposalPda,
            cooperative: votingCooperativePda,
            member: member3Pda,
            vote: vote3Pda,
            voter: member3.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([member3])
          .rpc();

        console.log("✅ Executable proposal created and passed");
      });

      it("Fails to execute proposal before voting period ends", async () => {
        // Voting period is 7 days, so it's still ongoing
        try {
          await program.methods
            .executeProposal()
            .accounts({
              proposal: executableProposalPda,
              cooperative: votingCooperativePda,
              authority: authority,
            })
            .rpc();

          expect.fail("Should have thrown error for voting period not ended");
        } catch (error) {
          expect(error.message).to.include("VotingPeriodNotEnded");
          console.log("✅ Correctly rejected execution before voting period ends");
        }
      });

      // Note: We can't easily test successful execution without time travel
      // This would require a separate test with a very short voting period (not implemented yet)

      it("Fails when non-authority tries to execute", async () => {
        const unauthorizedUser = anchor.web3.Keypair.generate();

        // Airdrop SOL
        await provider.connection.requestAirdrop(unauthorizedUser.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        try {
          await program.methods
            .executeProposal()
            .accounts({
              proposal: executableProposalPda,
              cooperative: votingCooperativePda,
              authority: unauthorizedUser.publicKey,
            })
            .signers([unauthorizedUser])
            .rpc();

          expect.fail("Should have thrown error for unauthorized execution");
        } catch (error) {
          expect(error.message).to.include("Unauthorized");
          console.log("✅ Correctly rejected unauthorized execution");
        }
      });
    });
  });
});
