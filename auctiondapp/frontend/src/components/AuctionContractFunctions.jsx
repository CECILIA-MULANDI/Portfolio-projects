import { ethers } from "ethers";
import auctionABI from "../abi.json"; // Import ABI

const CONTRACT_ADDRESS = "0x04A832C2A8c8a571F81CFFE1218e1067bDCB6614";
export const getAuctionContract = (signerOrProvider) => {
  return new ethers.Contract(CONTRACT_ADDRESS, auctionABI, signerOrProvider);
};

export const createAuction = async (
  signer,
  name,
  startingPrice,
  description,
  duration
) => {
  if (!signer) {
    alert("Please connect your wallet!");
    return;
  }

  try {
    const contract = getAuctionContract(signer);

    // Convert ETH to Wei
    const priceInWei = ethers.utils.parseEther(startingPrice);

    const tx = await contract.createAuction(
      name,
      priceInWei, // Use the converted value
      description,
      duration
    );
    await tx.wait();
    alert("Auction created successfully!");
  } catch (error) {
    console.error("Error creating auction:", error);
    alert("Failed to create auction.");
  }
};

export const placeBid = async (signer, auctionId, bidAmount) => {
  if (!signer) {
    alert("Please connect your wallet!");
    return;
  }

  try {
    const contract = getAuctionContract(signer);
    const tx = await contract.placeBid(auctionId, {
      value: ethers.utils.parseEther(bidAmount),
    });
    await tx.wait();
    alert("Bid placed successfully!");
  } catch (error) {
    console.error("Error placing bid:", error);
    alert("Failed to place bid.");
  }
};

export const endAuction = async (signer, auctionId) => {
  if (!signer) {
    alert("Please connect your wallet!");
    return;
  }

  try {
    const contract = getAuctionContract(signer);
    const tx = await contract.endAuction(auctionId);
    await tx.wait();
    alert("Auction ended successfully!");
  } catch (error) {
    console.error("Error ending auction:", error);
    alert("Failed to end auction.");
  }
};

export const withdrawFunds = async (signer) => {
  if (!signer) {
    alert("Please connect your wallet!");
    return;
  }

  try {
    const contract = getAuctionContract(signer);
    const tx = await contract.withdraw();
    await tx.wait();
    alert("Funds withdrawn successfully!");
  } catch (error) {
    console.error("Error withdrawing funds:", error);
    alert("Failed to withdraw funds.");
  }
};

export const getAuctionDetails = async (provider, auctionId) => {
  try {
    console.log("Getting contract with provider:", provider);
    const contract = getAuctionContract(provider);
    console.log("Fetching auction ID:", auctionId);
    const auction = await contract.getAuction(auctionId);
    console.log("Raw auction data:", auction);

    // Make sure BigNumber values are properly formatted
    return {
      seller: auction[0],
      name: auction[1],
      description: auction[2],
      startingPrice: ethers.utils.formatEther(auction[3]),
      highestBid: ethers.utils.formatEther(auction[4]),
      highestBidder: auction[5],
      endTime: new Date(Number(auction[6]) * 1000).toLocaleString(),
      ended: auction[7],
    };
  } catch (error) {
    console.error("Error fetching auction:", error);
    return null;
  }
};
