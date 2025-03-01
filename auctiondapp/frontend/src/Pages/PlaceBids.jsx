import { useState, useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import { useParams, useNavigate } from "react-router-dom";
import { placeBid } from "../components/AuctionContractFunctions";
import { ethers } from "ethers";

const PlaceBid = () => {
  const { signer, account } = useContext(Web3Context);
  const { auctionId } = useParams(); // Get auction ID from URL
  const navigate = useNavigate();
  const [bidAmount, setBidAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate bid amount
      const bidAmountNum = parseFloat(bidAmount);
      if (isNaN(bidAmountNum) || bidAmountNum <= 0) {
        setError("Please enter a valid bid amount");
        setLoading(false);
        return;
      }

      // Convert bid amount to Wei
      const bidAmountInWei = ethers.utils.parseEther(bidAmount.toString());

      // Validate auction ID
      if (!auctionId || isNaN(parseInt(auctionId))) {
        setError("Invalid auction ID");
        setLoading(false);
        return;
      }

      // Place the bid
      const result = await placeBid(
        signer,
        parseInt(auctionId),
        bidAmountInWei
      );

      if (result.success) {
        alert("Bid placed successfully!");
        // Redirect to user bids page instead of home
        navigate("/my-bids");
      } else {
        setError(result.message || "Error placing bid");
      }
    } catch (error) {
      console.error("Error placing bid:", error);
      setError(error.message || "Error placing bid");
    } finally {
      setLoading(false);
    }
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
        <h2 style={{ color: "#fff", marginBottom: "15px" }}>Place a Bid</h2>
        <p style={{ color: "#bbb", marginBottom: "20px" }}>
          Auction ID: {auctionId}
        </p>

        {error && (
          <div
            style={{
              color: "#ff6b6b",
              backgroundColor: "rgba(255, 107, 107, 0.1)",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "15px",
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <input
            type="number"
            step="0.000001"
            min="0.000001"
            placeholder="Bid Amount (ETH)"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
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
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? "#666" : "#007bff",
              color: "white",
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "0.3s",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
            onMouseOver={(e) =>
              !loading && (e.target.style.backgroundColor = "#0056b3")
            }
            onMouseOut={(e) =>
              !loading && (e.target.style.backgroundColor = "#007bff")
            }
          >
            {loading ? "Processing..." : "Submit Bid"}
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          disabled={loading}
          style={{
            backgroundColor: "#dc3545",
            color: "white",
            padding: "10px",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "0.3s",
            fontWeight: "bold",
            opacity: loading ? 0.7 : 1,
          }}
          onMouseOver={(e) =>
            !loading && (e.target.style.backgroundColor = "#a71d2a")
          }
          onMouseOut={(e) =>
            !loading && (e.target.style.backgroundColor = "#dc3545")
          }
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PlaceBid;
