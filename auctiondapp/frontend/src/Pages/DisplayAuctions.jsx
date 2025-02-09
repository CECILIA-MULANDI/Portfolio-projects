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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctions = async () => {
      const auctionIds = [0, 1, 2]; // Replace with actual logic
      const auctionData = await Promise.all(
        auctionIds.map((id) => getAuctionDetails(provider, id))
      );
      setAuctions(auctionData);
    };

    fetchAuctions();
  }, [provider]);

  const handleEndAuction = async (auctionId) => {
    await endAuction(signer, auctionId);
  };

  const handleWithdrawFunds = async () => {
    await withdrawFunds(signer);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Active Auctions</h2>
      {auctions.length === 0 ? (
        <p>No auctions found.</p>
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
