import { useState, useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import { getAuctionContract } from "../components/AuctionContractFunctions";
import { ethers } from "ethers";
const CreateAuction = () => {
  const { signer } = useContext(Web3Context);
  const [auctionData, setAuctionData] = useState({
    name: "",
    startingPrice: "",
    description: "",
    duration: "",
  });
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });

  const handleChange = (e) => {
    setAuctionData({
      ...auctionData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });

    try {
      await createAuctionWithFeedback(
        signer,
        auctionData.name,
        auctionData.startingPrice,
        auctionData.description,
        auctionData.duration
      );

      // Clear form on success
      setAuctionData({
        name: "",
        startingPrice: "",
        description: "",
        duration: "",
      });

      // Show success message
      setStatus({ loading: false, success: true, error: null });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setStatus((prev) => ({ ...prev, success: false }));
      }, 5000);
    } catch (error) {
      setStatus({ loading: false, success: false, error: error.message });
    }
  };

  // Wrapped version of createAuction that returns promises instead of using alerts
  const createAuctionWithFeedback = async (
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
      const priceInWei = ethers.utils.parseEther(startingPrice);

      const tx = await contract.createAuction(
        name,
        priceInWei,
        description,
        duration
      );

      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error creating auction:", error);

      // Extract the specific error message from the blockchain error
      let errorMessage = "Failed to create auction.";

      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.data && error.data.message) {
        errorMessage = error.data.message;
      } else if (error.message) {
        // Check for common contract require error patterns
        if (error.message.includes("user rejected transaction")) {
          errorMessage = "Transaction rejected by user.";
        } else {
          // Look for the specific error messages from your contract requires
          const errorPatterns = [
            "Price must be greater than 0",
            "Duration must be greater than 0",
            "Name cannot be empty",
            "Description cannot be empty",
          ];

          for (const pattern of errorPatterns) {
            if (error.message.includes(pattern)) {
              errorMessage = pattern;
              break;
            }
          }
        }
      }

      throw new Error(errorMessage);
    }
  };

  // Define placeholders with specific instructions
  const placeholders = {
    name: "Auction Name",
    startingPrice: "Starting Price (ETH)",
    description: "Item Description",
    duration: "Duration (in seconds)",
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100vw",
        background: "#121212",
      }}
    >
      <div
        style={{
          background: "#1e1e1e",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(255,255,255,0.05)",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#fff", marginBottom: "20px" }}>Create Auction</h2>

        {/* Status Messages */}
        {status.error && (
          <div
            style={{
              backgroundColor: "rgba(220, 53, 69, 0.2)",
              color: "#ff6b6b",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid rgba(220, 53, 69, 0.3)",
            }}
          >
            {status.error}
          </div>
        )}

        {status.success && (
          <div
            style={{
              backgroundColor: "rgba(40, 167, 69, 0.2)",
              color: "#75b798",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid rgba(40, 167, 69, 0.3)",
            }}
          >
            Auction created successfully!
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column" }}
        >
          {Object.keys(auctionData).map((field) => (
            <input
              key={field}
              type="text"
              name={field}
              value={auctionData[field]}
              placeholder={placeholders[field]}
              onChange={handleChange}
              required
              style={{
                padding: "12px",
                marginBottom: "15px",
                borderRadius: "8px",
                border: "none",
                fontSize: "16px",
                background: "#252525",
                color: "#fff",
                outline: "none",
                transition: "0.3s",
              }}
              onFocus={(e) => (e.target.style.background = "#333")}
              onBlur={(e) => (e.target.style.background = "#252525")}
            />
          ))}
          <button
            type="submit"
            disabled={status.loading}
            style={{
              backgroundColor: status.loading ? "#0056b3" : "#007bff",
              color: "white",
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: status.loading ? "default" : "pointer",
              transition: "0.3s",
              fontWeight: "bold",
              opacity: status.loading ? 0.7 : 1,
            }}
            onMouseOver={(e) =>
              !status.loading && (e.target.style.backgroundColor = "#0056b3")
            }
            onMouseOut={(e) =>
              !status.loading && (e.target.style.backgroundColor = "#007bff")
            }
          >
            {status.loading ? "Creating..." : "Create Auction"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAuction;
