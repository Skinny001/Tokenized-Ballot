import { ethers } from "hardhat";
import { MyToken__factory, TokenizedBallot__factory } from "../typechain-types";

async function main() {
  // Get contract addresses from command line arguments or use default values
  const args = process.argv.slice(2);
  const myTokenAddress = args[0] || "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Default address
  const ballotAddress = args[1] || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Default address
  
  console.log(`Interacting with MyToken at: ${myTokenAddress}`);
  console.log(`Interacting with TokenizedBallot at: ${ballotAddress}`);
  
  // Get signers
  const [deployer, account1, account2, account3] = await ethers.getSigners();
  console.log("\nAccounts:");
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Account1: ${account1.address}`);
  console.log(`Account2: ${account2.address}`);
  console.log(`Account3: ${account3.address}`);
  
  // Get contract instances
  const myTokenContract = MyToken__factory.connect(myTokenAddress, ethers.provider);
  const ballotContract = TokenizedBallot__factory.connect(ballotAddress, ethers.provider);
  
  // Get target block number
  const targetBlockNumber = await ballotContract.targetBlockNumber();
  console.log(`\nTarget block number: ${targetBlockNumber}`);
  
  // Print initial state
  console.log("\n=== INITIAL STATE ===");
  
  // Check token balances
  const balance1 = await myTokenContract.balanceOf(account1.address);
  const balance2 = await myTokenContract.balanceOf(account2.address);
  const balance3 = await myTokenContract.balanceOf(account3.address);
  
  console.log("\nToken Balances:");
  console.log(`Account1: ${ethers.formatEther(balance1)} MTK`);
  console.log(`Account2: ${ethers.formatEther(balance2)} MTK`);
  console.log(`Account3: ${ethers.formatEther(balance3)} MTK`);
  
  // Check voting power
  const votingPower1 = await myTokenContract.getVotes(account1.address);
  const votingPower2 = await myTokenContract.getVotes(account2.address);
  const votingPower3 = await myTokenContract.getVotes(account3.address);
  
  console.log("\nVoting Power:");
  console.log(`Account1: ${ethers.formatEther(votingPower1)} votes`);
  console.log(`Account2: ${ethers.formatEther(votingPower2)} votes`);
  console.log(`Account3: ${ethers.formatEther(votingPower3)} votes`);
  
  // Check past voting power at target block
  try {
    const pastVotes1 = await ballotContract.getRemainingVotingPower(account1.address);
    const pastVotes2 = await ballotContract.getRemainingVotingPower(account2.address);
    const pastVotes3 = await ballotContract.getRemainingVotingPower(account3.address);
    
    console.log("\nRemaining Voting Power at Target Block:");
    console.log(`Account1: ${ethers.formatEther(pastVotes1)} votes`);
    console.log(`Account2: ${ethers.formatEther(pastVotes2)} votes`);
    console.log(`Account3: ${ethers.formatEther(pastVotes3)} votes`);
  } catch (error) {
    console.error("\nError checking past votes:", error.message);
  }
  
  // Display proposals
  console.log("\nProposals:");
  for (let i = 0; i < 3; i++) {
    const proposal = await ballotContract.proposals(i);
    const name = ethers.decodeBytes32String(proposal.name);
    console.log(`${i}: ${name} - ${proposal.voteCount} votes`);
  }
  
  // Vote for proposals
  console.log("\n=== CASTING VOTES ===");
  
  try {
    // Account1 votes for proposal 0
    const voteAmount1 = ethers.parseEther("30");
    console.log(`\nAccount1 voting ${ethers.formatEther(voteAmount1)} for Proposal 0...`);
    const voteTx1 = await ballotContract.connect(account1).vote(0, voteAmount1);
    const receipt1 = await voteTx1.wait();
    console.log(`Transaction successful! Hash: ${voteTx1.hash}`);
    
    // Account2 votes for proposal 1
    const voteAmount2 = ethers.parseEther("20");
    console.log(`\nAccount2 voting ${ethers.formatEther(voteAmount2)} for Proposal 1...`);
    const voteTx2 = await ballotContract.connect(account2).vote(1, voteAmount2);
    const receipt2 = await voteTx2.wait();
    console.log(`Transaction successful! Hash: ${voteTx2.hash}`);
    
    // Account3 votes for proposal 2
    const voteAmount3 = ethers.parseEther("40");
    console.log(`\nAccount3 voting ${ethers.formatEther(voteAmount3)} for Proposal 2...`);
    const voteTx3 = await ballotContract.connect(account3).vote(2, voteAmount3);
    const receipt3 = await voteTx3.wait();
    console.log(`Transaction successful! Hash: ${voteTx3.hash}`);
    
    // Account1 tries to overspend voting power
    console.log("\nAccount1 trying to overspend voting power...");
    try {
      const voteAmount4 = ethers.parseEther("80");
      const voteTx4 = await ballotContract.connect(account1).vote(0, voteAmount4);
      await voteTx4.wait();
      console.log(`Transaction successful! Hash: ${voteTx4.hash}`);
    } catch (error) {
      console.log(`Transaction reverted: ${error.message}`);
    }
    
    // Account3 votes for another proposal
    const voteAmount5 = ethers.parseEther("30");
    console.log(`\nAccount3 voting ${ethers.formatEther(voteAmount5)} for Proposal 0...`);
    const voteTx5 = await ballotContract.connect(account3).vote(0, voteAmount5);
    const receipt5 = await voteTx5.wait();
    console.log(`Transaction successful! Hash: ${voteTx5.hash}`);
    
  } catch (error) {
    console.error("Error in voting process:", error);
  }
  
  // Check updated voting power
  console.log("\n=== UPDATED STATE AFTER VOTING ===");
  
  try {
    const remainingVotes1 = await ballotContract.getRemainingVotingPower(account1.address);
    const remainingVotes2 = await ballotContract.getRemainingVotingPower(account2.address);
    const remainingVotes3 = await ballotContract.getRemainingVotingPower(account3.address);
    
    console.log("\nRemaining Voting Power:");
    console.log(`Account1: ${ethers.formatEther(remainingVotes1)} votes`);
    console.log(`Account2: ${ethers.formatEther(remainingVotes2)} votes`);
    console.log(`Account3: ${ethers.formatEther(remainingVotes3)} votes`);
  } catch (error) {
    console.error("\nError checking remaining votes:", error.message);
  }
  
  // Display updated proposal votes
  console.log("\nUpdated Proposals:");
  for (let i = 0; i < 3; i++) {
    const proposal = await ballotContract.proposals(i);
    const name = ethers.decodeBytes32String(proposal.name);
    console.log(`${i}: ${name} - ${ethers.formatEther(proposal.voteCount)} votes`);
  }
  
  // Check winning proposal
  try {
    const winningProposalIndex = await ballotContract.winningProposal();
    const winnerName = await ballotContract.winnerName();
    const decodedName = ethers.decodeBytes32String(winnerName);
    
    console.log("\n=== WINNER INFO ===");
    console.log(`Winning Proposal Index: ${winningProposalIndex}`);
    console.log(`Winning Proposal Name: ${decodedName}`);
  } catch (error) {
    console.error("\nError checking winner:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });