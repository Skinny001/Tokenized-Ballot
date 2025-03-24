import { ethers } from "hardhat";
import { MyToken__factory } from "../typechain-types";

async function main() {
  // Get token address from command line arguments or use default value
  const args = process.argv.slice(2);
  const myTokenAddress = args[0] || "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Default address
  
  console.log(`Interacting with MyToken at: ${myTokenAddress}`);
  
  // Get signers
  const [deployer, account1, account2, account3, account4] = await ethers.getSigners();
  console.log("\nAccounts:");
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Account1: ${account1.address}`);
  console.log(`Account2: ${account2.address}`);
  console.log(`Account3: ${account3.address}`);
  console.log(`Account4: ${account4.address}`);
  
  // Get contract instance
  const myTokenContract = MyToken__factory.connect(myTokenAddress, ethers.provider);
  
  // Check initial voting power
  console.log("\n=== INITIAL VOTING POWER ===");
  const votingPower1 = await myTokenContract.getVotes(account1.address);
  const votingPower2 = await myTokenContract.getVotes(account2.address);
  const votingPower3 = await myTokenContract.getVotes(account3.address);
  const votingPower4 = await myTokenContract.getVotes(account4.address);
  
  console.log(`Account1: ${ethers.formatEther(votingPower1)} votes`);
  console.log(`Account2: ${ethers.formatEther(votingPower2)} votes`);
  console.log(`Account3: ${ethers.formatEther(votingPower3)} votes`);
  console.log(`Account4: ${ethers.formatEther(votingPower4)} votes`);
  
  // Mint tokens to Account4 (who has no tokens yet)
  try {
    console.log("\nMinting tokens to Account4...");
    const mintAmount = ethers.parseEther("50");
    const mintTx = await myTokenContract.mint(account4.address, mintAmount);
    await mintTx.wait();
    console.log(`Minted ${ethers.formatEther(mintAmount)} tokens to ${account4.address}`);
    console.log(`Transaction hash: ${mintTx.hash}`);
    
    // Check balance of Account4
    const balance4 = await myTokenContract.balanceOf(account4.address);
    console.log(`Account4 balance: ${ethers.formatEther(balance4)} MTK`);
    
    // Check voting power again (should still be 0 until delegated)
    const votingPower4AfterMint = await myTokenContract.getVotes(account4.address);
    console.log(`Account4 voting power: ${ethers.formatEther(votingPower4AfterMint)} votes`);
  } catch (error) {
    console.error("\nError minting tokens:", error.message);
  }
  
  // Delegate from Account4 to Account1
  try {
    console.log("\n=== DELEGATING VOTES ===");
    console.log(`Account4 delegating to Account1...`);
    const delegateTx = await myTokenContract.connect(account4).delegate(account1.address);
    await delegateTx.wait();
    console.log(`Delegation successful!`);
    console.log(`Transaction hash: ${delegateTx.hash}`);
  } catch (error) {
    console.error("\nError delegating votes:", error.message);
  }
  
  // Check voting power after delegation
  console.log("\n=== VOTING POWER AFTER DELEGATION ===");
  const newVotingPower1 = await myTokenContract.getVotes(account1.address);
  const newVotingPower4 = await myTokenContract.getVotes(account4.address);
  
  console.log(`Account1: ${ethers.formatEther(newVotingPower1)} votes`);
  console.log(`Account4: ${ethers.formatEther(newVotingPower4)} votes`);
  
  // Try to delegate from Account4 to Account2
  try {
    console.log("\nAccount4 trying to re-delegate to Account2...");
    const delegateTx2 = await myTokenContract.connect(account4).delegate(account2.address);
    await delegateTx2.wait();
    console.log(`Delegation successful!`);
    console.log(`Transaction hash: ${delegateTx2.hash}`);
  } catch (error) {
    console.error("\nError re-delegating votes:", error.message);
  }
  
  // Check final voting power
  console.log("\n=== FINAL VOTING POWER ===");
  const finalVotingPower1 = await myTokenContract.getVotes(account1.address);
  const finalVotingPower2 = await myTokenContract.getVotes(account2.address);
  const finalVotingPower4 = await myTokenContract.getVotes(account4.address);
  
  console.log(`Account1: ${ethers.formatEther(finalVotingPower1)} votes`);
  console.log(`Account2: ${ethers.formatEther(finalVotingPower2)} votes`);
  console.log(`Account4: ${ethers.formatEther(finalVotingPower4)} votes`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });