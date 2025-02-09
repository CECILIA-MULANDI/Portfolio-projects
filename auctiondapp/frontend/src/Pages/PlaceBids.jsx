import { useState, useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import { useParams, useNavigate } from "react-router-dom";
import { placeBid } from "../components/AuctionContractFunctions";

const PlaceBid = () => {
  const { signer } = useContext(Web3Context);
  const { auctionId } = useParams(); // 🔹 Get auction ID from URL
  const navigate = useNavigate();
  const [bidAmount, setBidAmount] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await placeBid(signer, auctionId, bidAmount);
      alert("Bid placed successfully!");
      navigate("/"); // 🔹 Redirect back to auction list
    } catch (error) {
      alert("Error placing bid: " + error.message);
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

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <input
            type="text"
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
            style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
              transition: "0.3s",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
          >
            Submit Bid
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          style={{
            backgroundColor: "#dc3545",
            color: "white",
            padding: "10px",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            cursor: "pointer",
            transition: "0.3s",
            fontWeight: "bold",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#a71d2a")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#dc3545")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PlaceBid;
