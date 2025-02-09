const { ethers } = require("hardhat");
const hre = require("hardhat");
async function main() {
  // Get the contract factory
  const AuctionContract = await hre.ethers.getContractFactory(
    "AuctionContract"
  );

  console.log("Deploying AuctionContract...");

  // Deploy the contract
  const auction = await AuctionContract.deploy();
  await auction.waitForDeployment();

  console.log("AuctionContract deployed to:", await auction.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
