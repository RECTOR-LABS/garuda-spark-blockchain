# ⚠️ DEPRECATED: Git Submodule Setup Guide

**STATUS**: This document is **DEPRECATED** as of October 9, 2025.

**REASON**: Strategic pivot from 3 parallel projects to single-project focus on KoperasiChain.

**CURRENT STRATEGY**: All development resources now focused on building ONE exceptional KoperasiChain solution for 1st place.

**ARCHIVED PROJECTS**: SumberBenar and EcoChain have been moved to `archive/` directory.

---

## Historical Context

This document originally explained how to set up git submodules for 3 separate project repositories (KoperasiChain, SumberBenar, EcoChain) during the multi-project strategy phase.

**Previous Strategy (Deprecated)**: 3 parallel projects to maximize win probability
**Current Strategy**: Single-project excellence on KoperasiChain

---

# Original Document (For Historical Reference Only)

This document explains how to set up git submodules for the 3 project repositories.

## What are Git Submodules?

Git submodules allow you to keep a Git repository as a subdirectory of another Git repository. This lets each project (KoperasiChain, SumberBenar, EcoChain) have its own independent repository while being managed from this main coordination repository.

## Benefits

✅ **Independent Repositories**: Each project can be submitted as a separate GitHub repo
✅ **Team Autonomy**: Teams work in their own repos without conflicts
✅ **Shared Coordination**: Main repo coordinates all 3 projects
✅ **Clean Submission**: Each project has its own commit history

---

## Setup Instructions

### Option 1: Create New Repositories for Each Project

**Step 1: Create GitHub Repositories**

Create 3 new repositories on GitHub:
- `koperasichain`
- `sumberbenar`
- `ecochain`

**Step 2: Add as Submodules**

```bash
# From main repository root
cd /Users/rz/local-dev/garuda-spark-blockchain

# Add KoperasiChain as submodule
git submodule add https://github.com/YOUR_ORG/koperasichain.git projects/koperasichain

# Add SumberBenar as submodule
git submodule add https://github.com/YOUR_ORG/sumberbenar.git projects/sumberbenar

# Add EcoChain as submodule
git submodule add https://github.com/YOUR_ORG/ecochain.git projects/ecochain

# Commit the submodule configuration
git add .gitmodules projects/
git commit -m "Add project submodules"
```

**Step 3: Initialize Projects**

```bash
# Navigate to each project and initialize
cd projects/koperasichain
anchor init . --force
git add .
git commit -m "Initial Anchor project setup"
git push origin main

# Repeat for other projects
cd ../sumberbenar
anchor init . --force
git add .
git commit -m "Initial Anchor project setup"
git push origin main

cd ../ecochain
anchor init . --force
git add .
git commit -m "Initial Anchor project setup"
git push origin main
```

---

### Option 2: Convert Existing Directories to Submodules

If you've already started working in the `projects/` directories:

**Step 1: Move Existing Work**

```bash
# Create temporary backup
mv projects/koperasichain /tmp/koperasichain-backup
mv projects/sumberbenar /tmp/sumberbenar-backup
mv projects/ecochain /tmp/ecochain-backup
```

**Step 2: Create Repos and Add as Submodules**

```bash
# Create GitHub repos first, then:
git submodule add https://github.com/YOUR_ORG/koperasichain.git projects/koperasichain
git submodule add https://github.com/YOUR_ORG/sumberbenar.git projects/sumberbenar
git submodule add https://github.com/YOUR_ORG/ecochain.git projects/ecochain
```

**Step 3: Restore Work**

```bash
# Copy backed-up work into submodules
cp -r /tmp/koperasichain-backup/* projects/koperasichain/
cp -r /tmp/sumberbenar-backup/* projects/sumberbenar/
cp -r /tmp/ecochain-backup/* projects/ecochain/

# Commit in each submodule
cd projects/koperasichain
git add .
git commit -m "Initial project setup"
git push origin main

# Repeat for others...
```

---

### Option 3: Keep as Simple Subdirectories (No Submodules)

If submodules feel complex, you can skip them and just use subdirectories:

```bash
# Each project lives in projects/ folder
# No submodule setup needed
# When ready to submit, create separate repos manually

# To extract later:
cd projects/koperasichain
git init
git remote add origin https://github.com/YOUR_ORG/koperasichain.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

**Pros**: Simpler workflow
**Cons**: Harder to collaborate across teams, manual extraction needed for submission

---

## Working with Submodules

### Cloning the Main Repo (For New Team Members)

```bash
# Clone with submodules
git clone --recursive https://github.com/YOUR_ORG/garuda-spark-blockchain.git

# Or if already cloned without submodules
git clone https://github.com/YOUR_ORG/garuda-spark-blockchain.git
cd garuda-spark-blockchain
git submodule init
git submodule update
```

### Making Changes in a Submodule

```bash
# Navigate to submodule
cd projects/koperasichain

# Work normally
git checkout -b feature/voting-system
# ... make changes ...
git add .
git commit -m "Implement voting smart contract"
git push origin feature/voting-system

# Create PR in the submodule repo
```

### Updating Main Repo with Submodule Changes

```bash
# After changes are merged in submodule
cd /Users/rz/local-dev/garuda-spark-blockchain

# Update submodule reference
cd projects/koperasichain
git pull origin main
cd ../..

# Commit the updated submodule reference in main repo
git add projects/koperasichain
git commit -m "Update KoperasiChain to latest"
git push
```

### Pulling Latest Changes (All Submodules)

```bash
# From main repo root
git pull
git submodule update --remote --merge
```

---

## Recommended Workflow

### For This Hackathon: **Option 3 (Simple Subdirectories)**

**Reasoning**:
- 23 days is tight - minimize git complexity
- Teams work autonomously in their folders
- Extract to separate repos when ready for submission (Oct 29)

**Workflow**:
```bash
# Week 1-3: Work in subdirectories
cd projects/koperasichain
# ... develop ...

# Oct 28-29: Extract to separate repos for submission
cd projects/koperasichain
git init
git remote add origin <new-repo-url>
git add .
git commit -m "KoperasiChain - Blockchain cooperative platform"
git push -u origin main
```

---

## Alternative: Monorepo with Multiple Submissions

Keep everything in one repo, submit 3 separate links:

```
Main Repo: garuda-spark-blockchain
├── projects/koperasichain/  → Submit this folder's link
├── projects/sumberbenar/    → Submit this folder's link
└── projects/ecochain/       → Submit this folder's link
```

**Submission**:
- GitHub link 1: `https://github.com/YOUR_ORG/garuda-spark-blockchain/tree/main/projects/koperasichain`
- GitHub link 2: `https://github.com/YOUR_ORG/garuda-spark-blockchain/tree/main/projects/sumberbenar`
- GitHub link 3: `https://github.com/YOUR_ORG/garuda-spark-blockchain/tree/main/projects/ecochain`

**Pros**: One repo, simple workflow
**Cons**: Shared commit history, less "polished" for judges

---

## Recommendation for RECTOR's Team

Given 10+ senior devs and 23 days:

**Use Simple Subdirectories (Option 3) during development**
**Extract to separate repos 48 hours before submission (Oct 29)**

This maximizes development speed while maintaining clean submission appearance.

---

## Commands Cheat Sheet

```bash
# Add submodule
git submodule add <repo-url> <path>

# Clone with submodules
git clone --recursive <repo-url>

# Initialize submodules (if cloned without --recursive)
git submodule init
git submodule update

# Update all submodules to latest
git submodule update --remote --merge

# Work in submodule
cd projects/koperasichain
git checkout -b feature-branch
git add . && git commit -m "Changes"
git push origin feature-branch

# Update main repo submodule reference
git add projects/koperasichain
git commit -m "Update submodule reference"
```

---

**Bismillah** - Choose the workflow that maximizes team velocity. For this hackathon, simplicity wins.
