import { useState, useEffect, useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import {
  getAuctionDetails,
  endAuction,
  withdrawFunds,
} from "../components/AuctionContractFunctions";
import { useNavigate } from "react-router-dom";

const AuctionList = () => {
  const { provider, signer } = useContext(Web3Context);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctions = async () => {
      if (!provider) {
        setError("Web3 provider not connected");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const contract = getAuctionDetails(provider);
        const auctionCount = await contract.getAuctionCount(); // Add this function in the contract if needed
        const auctionData = [];

        for (let id = 0; id < auctionCount; id++) {
          try {
            const details = await getAuctionDetails(provider, id);
            if (details && details.name) {
              auctionData.push(details);
            }
          } catch (err) {
            console.error(`Error fetching auction ${id}:`, err);
          }
        }

        setAuctions(auctionData);
      } catch (err) {
        console.error("Error fetching auctions:", err);
        setError("Failed to load auctions.");
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [provider]);

  const handleEndAuction = async (auctionId) => {
    try {
      if (!signer) {
        alert("Please connect your wallet to end an auction");
        return;
      }
      await endAuction(signer, auctionId);
      alert("Auction end requested. Please wait for transaction confirmation.");
      // Refresh auctions after a successful transaction
      window.location.reload();
    } catch (err) {
      console.error("Error ending auction:", err);
      alert("Failed to end auction. See console for details.");
    }
  };

  const handleWithdrawFunds = async () => {
    try {
      if (!signer) {
        alert("Please connect your wallet to withdraw funds");
        return;
      }
      await withdrawFunds(signer);
      alert("Withdrawal requested. Please wait for transaction confirmation.");
    } catch (err) {
      console.error("Error withdrawing funds:", err);
      alert("Failed to withdraw funds. See console for details.");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Active Auctions</h2>

      {loading ? (
        <p>Loading auctions...</p>
      ) : error ? (
        <div style={{ color: "red", margin: "20px 0" }}>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: "10px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Retry
          </button>
        </div>
      ) : auctions.length === 0 ? (
        <p>
          No auctions found. There might not be any active auctions in the
          contract.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          {auctions.map((auction, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "20px",
                backgroundColor: "#343a40",
                color: "white",
                boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                textAlign: "left",
              }}
            >
              <h3>{auction.name}</h3>
              <p>{auction.description}</p>
              <p>
                <strong>Starting Price:</strong> {auction.startingPrice} ETH
              </p>
              <p>
                <strong>Highest Bid:</strong> {auction.highestBid} ETH
              </p>
              <p>
                <strong>End Time:</strong> {auction.endTime}
              </p>

              <button
                onClick={() => navigate(`/place-bid/${index}`)}
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  padding: "10px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  width: "100%",
                  marginTop: "10px",
                }}
              >
                Place Bid
              </button>
              <button
                onClick={() => handleEndAuction(index)}
                style={{
                  backgroundColor: "red",
                  color: "white",
                  padding: "10px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  width: "100%",
                  marginTop: "10px",
                }}
              >
                End Auction
              </button>
            </div>
          ))}
        </div>
      )}

      <hr />
      <h2>Account Actions</h2>
      <button
        onClick={handleWithdrawFunds}
        style={{
          backgroundColor: "green",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Withdraw Funds
      </button>
    </div>
  );
};

export default AuctionList;
