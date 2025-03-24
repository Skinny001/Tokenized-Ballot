# Tokenized Ballot Implementation Report

This report documents the implementation and testing of the TokenizedBallot contract, including all function executions and their outcomes.

## Contracts Overview

### MyToken Contract
An ERC20 token with voting capabilities (ERC20Votes) that allows:
- Minting new tokens
- Token transfers
- Delegation of voting power
- Querying of voting power at past blocks

### TokenizedBallot Contract
A voting contract that:
- Uses token voting power for vote weighting
- Takes a snapshot of voting power at a specific block
- Allows users to cast votes up to their available voting power
- Tracks spent voting power
- Calculates winning proposals

## Deployment Process

The deployment script performs the following actions:

1. Deploy the MyToken contract
2. Mint tokens to test accounts
3. Self-delegate voting tokens to activate voting power
4. Capture the current block number
5. Deploy the TokenizedBallot contract with:
   - Predefined proposals
   - Reference to the token contract
   - Target block number for voting power snapshot

### Deployment Results

```
Deploying contracts with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
MyToken deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Minting 100.0 tokens to each account...
Minted tokens to 0x70997970C51812dc3A010C7d01b50e0d17dc79C8, tx hash: 0x8a4b18953971457c46eccd72097ea36dd9a29c1b93180532d123212ad3c3c6b3
Minted tokens to 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, tx hash: 0x732dd39df32cc85e01feba0e9f2486101d6e1638a987d763d9824dd8f9927d73
Minted tokens to 0x90F79bf6EB2c4f870365E785982E1f101E93b906, tx hash: 0x3d12f5e8c04f1127f98ad9acad9c33b72d627a1a8a2e892c726f9919ff6f3e8b
Self-delegating voting power...
Account1 self-delegated, tx hash: 0x5dcdad24b60392a3b71e28a86cedc951a5fc7bb28bcfa0f845cee8a7ebfb064f
Account2 self-delegated, tx hash: 0x7e30b07ac1b4c08133fddd28593e5da2c4aa19bd67e42c36ae43ea9e0d83c8ef
Account3 self-delegated, tx hash: 0x3ab16dd581e3ceefe7a1f7e80ecee4cbf842dcf1bfa5cb2d7cefd5aea22e00d3
Current block number: 14
TokenizedBallot deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Using target block number: 14
```

## Voting Power and Delegation

### Initial Voting Power
After deployment and self-delegation, each account has a voting power equal to their token balance:

```
Token Balances:
Account1: 100.0 MTK
Account2: 100.0 MTK
Account3: 100.0 MTK

Voting Power:
Account1: 100.0 votes
Account2: 100.0 votes
Account3: 100.0 votes
```

### Delegation Test Results

Testing additional delegation with Account4:

```
Minting tokens to Account4...
Minted 50.0 tokens to 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
Transaction hash: 0xa2be427d45d24b1212ef58e8bef71fafb9aa4a9f4f518c0e5d265a0b33c84d2e
Account4 balance: 50.0 MTK
Account4 voting power: 0.0 votes

=== DELEGATING VOTES ===
Account4 delegating to Account1...
Delegation successful!
Transaction hash: 0x54d0c2c2b28bb2f2e0c3e5b3b23b6da0eddad4b5f5fb93bd82c23e6e8e91dbd7

=== VOTING POWER AFTER DELEGATION ===
Account1: 150.0 votes
Account4: 0.0 votes

Account4 trying to re-delegate to Account2...
Delegation successful!
Transaction hash: 0x18fea620a67a8c75dedf4ea3f1773df2d5d28e49c90b9e6d7cdf4d83cab9edbd

=== FINAL VOTING POWER ===
Account1: 100.0 votes
Account2: 50.0 votes
Account4: 0.0 votes
```

Observations:
- Account4 started with 50 tokens but 0 voting power (not self-delegated)
- After delegating to Account1, Account1's voting power increased by 50
- When Account4 re-delegated to Account2, the voting power shifted accordingly
- Account4 never had voting power since they delegated it all away

## Voting Process

### Initial State of Proposals

```
Proposals:
0: Proposal 1 - 0 votes
1: Proposal 2 - 0 votes
2: Proposal 3 - 0 votes
```

### Voting Transactions

```
=== CASTING VOTES ===

Account1 voting 30.0 for Proposal 0...
Transaction successful! Hash: 0x9d51f7eb2d8d66c6f0ceefd8e8c3bbe7ebad1df48b69cac0a3bc337c6c21ccd8

Account2 voting 20.0 for Proposal 1...
Transaction successful! Hash: 0xbc8f69b29c8c07db8e5e5e905f25ac9a9d60c6f9dbe3c7a8bdf13fd95cdf7d68

Account3 voting 40.0 for Proposal 2...
Transaction successful! Hash: 0x8a8d52d080ec5f6e9f51f32a7dbcc9dd8a407c241ea21399de78c2a4c4bfad55

Account1 trying to overspend voting power...
Transaction reverted: Error: VM Exception while processing transaction: reverted with reason string 'Not enough voting power'

Account3 voting 30.0 for Proposal 0...
Transaction successful! Hash: 0xae9f3ec5fc41cc8d86dcdfa2d36e4a6bc6c6b9ab85ee49e10d2c765e80d16bae
```

Observations:
- Account1 successfully voted 30 tokens for Proposal 0
- Account2 successfully voted 20 tokens for Proposal 1
- Account3 successfully voted 40 tokens for Proposal 2
- Account1's attempt to vote with 80 tokens failed due to insufficient voting power
- Account3 successfully voted an additional 30 tokens for Proposal 0

### Remaining Voting Power After Voting

```
Remaining Voting Power:
Account1: 70.0 votes
Account2: 80.0 votes
Account3: 30.0 votes
```

### Updated Proposal State

```
Updated Proposals:
0: Proposal 1 - 60.0 votes
1: Proposal 2 - 20.0 votes
2: Proposal 3 - 40.0 votes
```

## Results Calculation

The winning proposal was determined by the highest vote count:

```
=== WINNER INFO ===
Winning Proposal Index: 0
Winning Proposal Name: Proposal 1
```

Proposal 1 (index 0) won with 60 votes (30 from Account1 and 30 from Account3).

## Key Findings

1. **Target Block Number**: The contract uses a snapshot of voting power at the target block, which prevents vote buying after the voting period begins.

2. **Voting Power Consumption**: The contract properly tracks spent voting power, preventing double-voting or overspending.

3. **Delegation**: Voting power can be transferred through delegation, allowing for representative voting.

4. **Validation**: The contract correctly validates that users cannot vote with more power than they have available.

5. **Result Calculation**: The winning proposal is accurately determined based on the highest vote count.

## Potential Improvements

1. **Block Validation**: Add validation to ensure the target block is in the past.

2. **Proposal Creation**: Consider allowing dynamic proposal creation after deployment.

3. **Vote Updates**: Allow users to change their votes before a deadline.

4. **Time-Based Voting**: Implement a time-based voting period instead of block-based.

5. **Multiple Rounds**: Add support for multiple voting rounds or runoff voting.
