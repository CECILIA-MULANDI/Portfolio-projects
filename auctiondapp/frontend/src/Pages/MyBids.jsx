import { useState, useEffect, useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { getAuctionContract } from "../components/AuctionContractFunctions";

const MyBids = () => {
  const { contract, account } = useContext(Web3Context);
  const [userBids, setUserBids] = useState([]);
  const [auctionDetails, setAuctionDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState({
    account: null,
    contractAvailable: false,
    bidsResponse: null,
  });

  useEffect(() => {
    const fetchUserBids = async () => {
      // Update debug info
      setDebugInfo((prev) => ({
        ...prev,
        account: account,
        contractAvailable: !!contract,
      }));

      if (!contract || !account) {
        setError(
          "Contract or account not available. Please make sure your wallet is connected."
        );
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching bids for account:", account);

        // Get the auction IDs the user has bid on
        const bids = await contract.getUserBids(account);
        console.log("Bids response:", bids);

        // Update debug info
        setDebugInfo((prev) => ({
          ...prev,
          bidsResponse: JSON.stringify(bids),
        }));

        // Check if bids is empty or undefined
        if (!bids || bids.length === 0) {
          console.log("No bids found for this account");
          setUserBids([]);
          setAuctionDetails([]);
          setLoading(false);
          return;
        }

        const bidIds = bids.map((id) => id.toNumber());
        console.log("Parsed bid IDs:", bidIds);
        setUserBids(bidIds);

        // Fetch details for each auction
        const details = await Promise.all(
          bidIds.map(async (auctionId) => {
            console.log("Fetching details for auction ID:", auctionId);

            // Call getAuction and destructure the returned values in the correct order
            const [
              seller,
              title,
              description,
              startingPrice,
              highestBid,
              highestBidder,
              endTime,
              ended,
            ] = await contract.getAuction(auctionId);

            console.log("Auction details:", {
              seller,
              title,
              description,
              startingPrice,
              highestBid,
              highestBidder,
              endTime,
              ended,
            });

            // Format auction data
            return {
              id: auctionId,
              title: title,
              description: description,
              startingPrice: ethers.utils.formatEther(startingPrice),
              highestBid: ethers.utils.formatEther(highestBid),
              isHighestBidder:
                highestBidder.toLowerCase() === account.toLowerCase(),
              endTime: new Date(endTime.toNumber() * 1000).toLocaleString(),
              ended: ended,
            };
          })
        );

        console.log("Formatted auction details:", details);
        setAuctionDetails(details);
      } catch (err) {
        console.error("Error fetching user bids:", err);
        setError(`Failed to load your bids: ${err.message}`);

        // Update debug info with error
        setDebugInfo((prev) => ({
          ...prev,
          error: err.message,
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchUserBids();
  }, [contract, account]);

  // Debug panel component
  const DebugPanel = () => (
    <div
      style={{
        margin: "30px 0",
        padding: "15px",
        background: "#333",
        borderRadius: "8px",
        fontSize: "14px",
      }}
    >
      <h3 style={{ marginBottom: "10px" }}>Debug Information</h3>
      <pre style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
        Account: {debugInfo.account || "Not connected"}\n Contract Available:{" "}
        {debugInfo.contractAvailable ? "Yes" : "No"}\n Bids Response:{" "}
        {debugInfo.bidsResponse || "No data"}\n Error:{" "}
        {debugInfo.error || "None"}
      </pre>
    </div>
  );

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#121212",
          color: "white",
        }}
      >
        <p>Loading your bids...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "40px",
        background: "#121212",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1 style={{ marginBottom: "30px", textAlign: "center" }}>My Bids</h1>

      {/* Show any errors */}
      {error && (
        <div
          style={{
            margin: "0 auto 30px auto",
            maxWidth: "600px",
            padding: "15px",
            background: "rgba(255, 107, 107, 0.1)",
            border: "1px solid #ff6b6b",
            borderRadius: "8px",
            color: "#ff6b6b",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {/* Debug panel - only visible during development */}
      <DebugPanel />

      {userBids.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "30px",
            background: "#1e1e1e",
            borderRadius: "12px",
          }}
        >
          <p>
            You haven't placed any bids yet or we couldn't retrieve your bids.
          </p>
          <p style={{ marginTop: "10px", fontSize: "14px", color: "#aaa" }}>
            Make sure you're connected with the same wallet you used to place
            bids.
          </p>
          <Link
            to="/"
            style={{
              display: "inline-block",
              marginTop: "15px",
              backgroundColor: "#007bff",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              textDecoration: "none",
              transition: "0.3s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
          >
            Browse Auctions
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          {auctionDetails.map((auction) => (
            <div
              key={auction.id}
              style={{
                background: "#1e1e1e",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 4px 20px rgba(255,255,255,0.05)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {auction.isHighestBidder && (
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    background: "#28a745",
                    color: "white",
                    padding: "5px 10px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  Highest Bidder
                </div>
              )}

              <h3 style={{ marginBottom: "15px", color: "#fff" }}>
                {auction.title}
              </h3>
              <p
                style={{
                  color: "#bbb",
                  marginBottom: "10px",
                  height: "40px",
                  overflow: "hidden",
                }}
              >
                {auction.description}
              </p>
              <div style={{ marginBottom: "5px" }}>
                <span style={{ color: "#aaa" }}>Starting Price: </span>
                <span style={{ color: "#fff" }}>
                  {auction.startingPrice} ETH
                </span>
              </div>
              <div style={{ marginBottom: "5px" }}>
                <span style={{ color: "#aaa" }}>Current Bid: </span>
                <span style={{ color: "#fff", fontWeight: "bold" }}>
                  {auction.highestBid} ETH
                </span>
              </div>
              <div style={{ marginBottom: "15px" }}>
                <span style={{ color: "#aaa" }}>Ends: </span>
                <span style={{ color: "#fff" }}>{auction.endTime}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Link
                  to={`/auction/${auction.id}`}
                  style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    padding: "8px 15px",
                    border: "none",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  View Details
                </Link>

                {!auction.ended && (
                  <Link
                    to={`/place-bid/${auction.id}`}
                    style={{
                      backgroundColor: "#6c757d",
                      color: "white",
                      padding: "8px 15px",
                      border: "none",
                      borderRadius: "8px",
                      textDecoration: "none",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    Update Bid
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <Link
          to="/"
          style={{
            display: "inline-block",
            backgroundColor: "#6c757d",
            color: "white",
            padding: "10px 20px",
            borderRadius: "8px",
            textDecoration: "none",
            transition: "0.3s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#5a6268")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#6c757d")}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default MyBids;
