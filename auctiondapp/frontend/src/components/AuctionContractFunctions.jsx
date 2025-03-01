import { ethers } from "ethers";
import auctionABI from "../abi.json";

const CONTRACT_ADDRESS = "0x63C1C323a829E32e8CbCee395aB3d67083cA0b2D";

export const getAuctionContract = (signerOrProvider) => {
  if (!signerOrProvider) {
    throw new Error("Signer or provider is required");
  }
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
    throw new Error("Please connect your wallet!");
  }

  try {
    const contract = getAuctionContract(signer);

    // Convert ETH to Wei
    const priceInWei = ethers.utils.parseEther(startingPrice);

    // Convert duration to seconds if it's not already
    const durationInSeconds = Number(duration);

    const tx = await contract.createAuction(
      name,
      priceInWei,
      description,
      durationInSeconds
    );

    const receipt = await tx.wait();
    return {
      success: true,
      message: "Auction created successfully!",
      txHash: receipt.transactionHash,
    };
  } catch (error) {
    console.error("Error creating auction:", error);
    return {
      success: false,
      message: parseErrorMessage(error, "Failed to create auction."),
    };
  }
};

export const placeBid = async (signer, auctionId, bidAmount) => {
  if (!signer) {
    return { success: false, message: "Please connect your wallet!" };
  }

  try {
    const contract = getAuctionContract(signer);
    const bidAmountWei = ethers.utils.parseEther(bidAmount);

    // Use getAuction instead of direct mapping access for better data handling
    const auctionDetails = await getAuctionDetails(signer.provider, auctionId);

    // Validate auction status before submitting transaction
    if (auctionDetails.ended) {
      return { success: false, message: "Auction has already ended" };
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const endTime = new Date(auctionDetails.endTime).getTime() / 1000;

    if (currentTime >= endTime) {
      return { success: false, message: "Auction has expired" };
    }

    const userAddress = await signer.getAddress();
    if (userAddress.toLowerCase() === auctionDetails.seller.toLowerCase()) {
      return { success: false, message: "Seller cannot bid on own auction" };
    }

    const startingPriceWei = ethers.utils.parseEther(
      auctionDetails.startingPrice
    );
    if (bidAmountWei.lt(startingPriceWei)) {
      return {
        success: false,
        message: `Bid must be at least ${auctionDetails.startingPrice} ETH`,
      };
    }

    const highestBidWei = ethers.utils.parseEther(auctionDetails.highestBid);
    if (highestBidWei.gt(0) && bidAmountWei.lte(highestBidWei)) {
      return {
        success: false,
        message: `Your bid must be higher than the current highest bid of ${auctionDetails.highestBid} ETH`,
      };
    }

    // Place the bid
    const tx = await contract.placeBid(auctionId, {
      value: bidAmountWei,
      gasLimit: 500000,
    });

    const receipt = await tx.wait();

    return {
      success: true,
      message: "Bid placed successfully!",
      txHash: receipt.transactionHash,
    };
  } catch (error) {
    console.error("Error placing bid:", error);
    return {
      success: false,
      message: parseErrorMessage(error, "Failed to place bid."),
    };
  }
};

export const endAuction = async (signer, auctionId) => {
  if (!signer) {
    return { success: false, message: "Please connect your wallet!" };
  }

  try {
    const contract = getAuctionContract(signer);

    // Validate auction state first
    const auctionDetails = await getAuctionDetails(signer.provider, auctionId);

    if (auctionDetails.ended) {
      return { success: false, message: "Auction has already ended" };
    }

    const userAddress = await signer.getAddress();
    if (userAddress.toLowerCase() !== auctionDetails.seller.toLowerCase()) {
      // Check if user is contract owner
      const owner = await contract.owner();
      if (userAddress.toLowerCase() !== owner.toLowerCase()) {
        return {
          success: false,
          message: "Only the seller or contract owner can end this auction",
        };
      }
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const endTime = new Date(auctionDetails.endTime).getTime() / 1000;

    if (currentTime < endTime) {
      return {
        success: false,
        message: "Auction cannot be ended before the end time",
      };
    }

    const tx = await contract.endAuction(auctionId);
    const receipt = await tx.wait();

    return {
      success: true,
      message: "Auction ended successfully!",
      txHash: receipt.transactionHash,
    };
  } catch (error) {
    console.error("Error ending auction:", error);
    return {
      success: false,
      message: parseErrorMessage(error, "Failed to end auction."),
    };
  }
};

export const withdrawFunds = async (signer) => {
  if (!signer) {
    return { success: false, message: "Please connect your wallet!" };
  }

  try {
    const contract = getAuctionContract(signer);

    // Check if user has funds to withdraw
    const userAddress = await signer.getAddress();
    const pendingAmount = await contract.getPendingReturn(userAddress);

    if (pendingAmount.eq(0)) {
      return {
        success: false,
        message: "You have no funds to withdraw",
      };
    }

    const tx = await contract.withdraw();
    const receipt = await tx.wait();

    const amountFormatted = ethers.utils.formatEther(pendingAmount);

    return {
      success: true,
      message: `${amountFormatted} ETH withdrawn successfully!`,
      txHash: receipt.transactionHash,
    };
  } catch (error) {
    console.error("Error withdrawing funds:", error);
    return {
      success: false,
      message: parseErrorMessage(error, "Failed to withdraw funds."),
    };
  }
};

export const getAuctionDetails = async (provider, auctionId) => {
  try {
    if (!provider) {
      throw new Error("Provider is required");
    }

    const contract = getAuctionContract(provider);

    // Use the contract's getAuction function
    const auction = await contract.getAuction(auctionId);

    // Format the data according to the returned tuple structure
    // The order matches what's defined in the contract's getAuction function
    const [
      seller,
      name,
      description,
      startingPrice,
      highestBid,
      highestBidder,
      endTime,
      ended,
    ] = auction;

    // Format the values
    return {
      seller,
      name,
      description,
      startingPrice: ethers.utils.formatEther(startingPrice),
      highestBid: ethers.utils.formatEther(highestBid),
      highestBidder,
      endTime: new Date(endTime.toNumber() * 1000).toLocaleString(),
      ended,
    };
  } catch (error) {
    console.error("Error fetching auction:", error);
    throw error;
  }
};

export const getUserBids = async (provider, userAddress) => {
  if (!provider || !userAddress) {
    console.error("Provider and user address are required to fetch user bids");
    return [];
  }

  try {
    const contract = getAuctionContract(provider);

    // Get auction IDs user has bid on
    const auctionIds = await contract.getUserBids(userAddress);

    if (!auctionIds || auctionIds.length === 0) {
      return [];
    }

    // Get full details for each auction
    const auctionDetails = await Promise.all(
      auctionIds.map(async (id) => {
        try {
          const details = await getAuctionDetails(provider, id);
          return {
            id: id.toString(),
            ...details,
          };
        } catch (error) {
          console.warn(`Error fetching details for auction ${id}:`, error);
          return { id: id.toString(), error: "Failed to load details" };
        }
      })
    );

    return auctionDetails;
  } catch (error) {
    console.error("Error fetching user bids:", error);
    return [];
  }
};

// Helper function to parse error messages from various ethereum error formats
const parseErrorMessage = (error, defaultMessage) => {
  if (!error) return defaultMessage;

  if (error.error && error.error.message) {
    return error.error.message;
  } else if (error.reason) {
    return error.reason;
  } else if (error.data && error.data.message) {
    return error.data.message;
  } else if (error.message) {
    if (error.message.includes("execution reverted")) {
      const revertMatch = error.message.match(/reason="([^"]+)"/);
      if (revertMatch && revertMatch[1]) {
        return revertMatch[1];
      } else if (error.message.includes("execution reverted:")) {
        const parts = error.message.split("execution reverted:");
        if (parts.length > 1) {
          return parts[1].trim();
        }
      }
    } else if (error.message.includes("insufficient funds")) {
      return "Insufficient funds in your wallet to complete this transaction.";
    } else if (error.message.includes("user rejected transaction")) {
      return "Transaction was rejected in your wallet.";
    }

    return error.message;
  }

  return defaultMessage;
};

// Utility function to check contract state
export const isContractPaused = async (provider) => {
  if (!provider) {
    throw new Error("Provider is required");
  }

  const contract = getAuctionContract(provider);
  return await contract.stopped();
};

// Get total number of auctions
export const getAuctionCount = async (provider) => {
  if (!provider) {
    throw new Error("Provider is required");
  }

  const contract = getAuctionContract(provider);
  const count = await contract.auctionCounter();
  return count.toNumber();
};
