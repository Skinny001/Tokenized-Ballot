import { ethers } from "hardhat";
import { MyToken__factory, TokenizedBallot__factory } from "../typechain-types";

async function main() {
  console.log("Deploying contracts...");
  
  // Get signers
  const [deployer, account1, account2, account3] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Deploy MyToken contract
  const myTokenFactory = new MyToken__factory(deployer);
  const myTokenContract = await myTokenFactory.deploy();
  await myTokenContract.waitForDeployment();
  const myTokenAddress = await myTokenContract.getAddress();
  console.log(`MyToken deployed to: ${myTokenAddress}`);
  
  // Mint tokens to accounts
  const mintAmount = ethers.parseEther("100");
  console.log(`Minting ${ethers.formatEther(mintAmount)} tokens to each account...`);
  
  const mintTx1 = await myTokenContract.mint(account1.address, mintAmount);
  await mintTx1.wait();
  console.log(`Minted tokens to ${account1.address}, tx hash: ${mintTx1.hash}`);
  
  const mintTx2 = await myTokenContract.mint(account2.address, mintAmount);
  await mintTx2.wait();
  console.log(`Minted tokens to ${account2.address}, tx hash: ${mintTx2.hash}`);
  
  const mintTx3 = await myTokenContract.mint(account3.address, mintAmount);
  await mintTx3.wait();
  console.log(`Minted tokens to ${account3.address}, tx hash: ${mintTx3.hash}`);
  
  // Self-delegate for accounts to activate voting power
  console.log("Self-delegating voting power...");
  
  const delegateTx1 = await myTokenContract.connect(account1).delegate(account1.address);
  await delegateTx1.wait();
  console.log(`Account1 self-delegated, tx hash: ${delegateTx1.hash}`);
  
  const delegateTx2 = await myTokenContract.connect(account2).delegate(account2.address);
  await delegateTx2.wait();
  console.log(`Account2 self-delegated, tx hash: ${delegateTx2.hash}`);
  
  const delegateTx3 = await myTokenContract.connect(account3).delegate(account3.address);
  await delegateTx3.wait();
  console.log(`Account3 self-delegated, tx hash: ${delegateTx3.hash}`);
  
  // Get current block number to use as target
  const currentBlock = await ethers.provider.getBlockNumber();
  console.log(`Current block number: ${currentBlock}`);
  
  // Define proposals
  const proposals = ["Proposal 1", "Proposal 2", "Proposal 3"].map(
    (name) => ethers.encodeBytes32String(name)
  );
  
  // Deploy TokenizedBallot with current block as target
  const tokenizedBallotFactory = new TokenizedBallot__factory(deployer);
  const tokenizedBallotContract = await tokenizedBallotFactory.deploy(
    proposals,
    myTokenAddress,
    currentBlock
  );
  await tokenizedBallotContract.waitForDeployment();
  const ballotAddress = await tokenizedBallotContract.getAddress();
  console.log(`TokenizedBallot deployed to: ${ballotAddress}`);
  console.log(`Using target block number: ${currentBlock}`);
  
  return {
    myTokenAddress,
    ballotAddress,
    accounts: {
      deployer: deployer.address,
      account1: account1.address,
      account2: account2.address,
      account3: account3.address,
    },
  };
}

main()
  .then((deployedInfo) => {
    console.log("Deployment completed successfully!");
    console.log(JSON.stringify(deployedInfo, null, 2));
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });