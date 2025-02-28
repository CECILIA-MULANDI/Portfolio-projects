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
    return { success: false, message: "Please connect your wallet!" };
  }

  try {
    const contract = getAuctionContract(signer);

    // First, try to simulate the transaction to get potential errors before sending
    // This can help identify specific revert reasons
    try {
      // Get the current auction details to validate the bid
      const auction = await contract.auctions(auctionId);
      console.log("Auction details:", auction);

      // Check if auction exists and is active
      if (!auction || auction.ended) {
        return {
          success: false,
          message: "Auction has ended or does not exist",
        };
      }

      // Check if current time is past the end time
      const currentBlockTimestamp = (await signer.provider.getBlock("latest"))
        .timestamp;
      if (currentBlockTimestamp >= auction.endTime) {
        return { success: false, message: "Auction has expired" };
      }

      // Check if the bid amount is sufficient
      if (ethers.BigNumber.from(bidAmount).lt(auction.startingPrice)) {
        return {
          success: false,
          message: `Bid must be at least ${ethers.utils.formatEther(
            auction.startingPrice
          )} ETH`,
        };
      }

      // Check if the current user is the seller
      const userAddress = await signer.getAddress();
      if (userAddress.toLowerCase() === auction.seller.toLowerCase()) {
        return { success: false, message: "Seller cannot bid on own auction" };
      }

      // Check if the bid is higher than the current highest bid
      if (
        auction.highestBid.gt(0) &&
        ethers.BigNumber.from(bidAmount).lte(auction.highestBid)
      ) {
        return {
          success: false,
          message: `Your bid must be higher than the current highest bid of ${ethers.utils.formatEther(
            auction.highestBid
          )} ETH`,
        };
      }
    } catch (validationError) {
      console.log("Validation error:", validationError);
      // Continue with the transaction, as this might be due to missing view functions
    }

    console.log(
      `Placing bid on auction ${auctionId} with amount:`,
      ethers.utils.formatEther(bidAmount),
      "ETH"
    );

    // Prepare transaction with value
    const tx = await contract.placeBid(auctionId, {
      value: bidAmount,
      gasLimit: 500000, // Increased gas limit
    });

    console.log("Transaction sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("Transaction receipt:", receipt);

    if (receipt.status === 1) {
      return { success: true, message: "Bid placed successfully!" };
    } else {
      return {
        success: false,
        message: "Transaction failed for unknown reason.",
      };
    }
  } catch (error) {
    console.error("Error placing bid:", error);

    // Enhanced error parsing for various Ethereum error formats
    let errorMessage = "Failed to place bid.";

    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.reason) {
      errorMessage = error.reason;
    } else if (error.data && error.data.message) {
      errorMessage = error.data.message;
    } else if (error.message) {
      // Try to extract revert reason from various error message formats
      if (error.message.includes("execution reverted")) {
        const revertMatch = error.message.match(/reason="([^"]+)"/);
        if (revertMatch && revertMatch[1]) {
          errorMessage = revertMatch[1];
        } else if (error.message.includes("execution reverted:")) {
          const parts = error.message.split("execution reverted:");
          if (parts.length > 1) {
            errorMessage = parts[1].trim();
          }
        }
      } else if (error.message.includes("insufficient funds")) {
        errorMessage = "Insufficient funds in your wallet to place this bid.";
      }
    }

    return { success: false, message: errorMessage };
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
