/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect, useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import { Link } from "react-router-dom";
import { getUserBids } from "../components/AuctionContractFunctions";

const MyBids = () => {
  const { provider, account } = useContext(Web3Context);
  const [auctionDetails, setAuctionDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState({
    account: null,
    providerAvailable: false,
    bidsCount: 0,
  });

  useEffect(() => {
    const fetchUserBids = async () => {
      // Update debug info
      setDebugInfo((prev) => ({
        ...prev,
        account: account,
        providerAvailable: !!provider,
      }));

      if (!provider || !account) {
        setError(
          "Provider or account not available. Please make sure your wallet is connected."
        );
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching bids for account:", account);

        // Use the getUserBids helper function instead of directly calling the contract
        const userAuctions = await getUserBids(provider, account);
        console.log("User auctions:", userAuctions);

        // Update debug info
        setDebugInfo((prev) => ({
          ...prev,
          bidsCount: userAuctions.length,
        }));

        // The getUserBids function already returns formatted auction details
        setAuctionDetails(userAuctions);
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
  }, [provider, account]);

  // Debug panel component
  const DebugPanel = () => (
    <div
      style={{
        margin: "30px 0",
        padding: "15px",
        background: "#333",
        borderRadius: "8px",
        fontSize: "14px",
        width: "100%",
      }}
    >
      <h3 style={{ marginBottom: "10px" }}>Debug Information</h3>
      <pre style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
        Account: {debugInfo.account || "Not connected"}\n Provider Available:{" "}
        {debugInfo.providerAvailable ? "Yes" : "No"}\n Bids Count:{" "}
        {debugInfo.bidsCount}\n Error: {debugInfo.error || "None"}
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
          width: "100vw",
          margin: 0,
          padding: 0,
        }}
      >
        <p>Loading your bids...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#121212",
        minHeight: "100vh",
        color: "white",
        width: "100vw",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Title section with center alignment */}
      <div
        style={{ width: "100vw", textAlign: "center", padding: "5vw 0 2vw 0" }}
      >
        <h1>My Bids</h1>
      </div>

      {/* Content container with proper padding */}
      <div style={{ padding: "0 5vw", width: "90vw", margin: "0 auto" }}>
        {/* Show any errors */}
        {error && (
          <div
            style={{
              margin: "0 auto 3vw auto",
              padding: "1.5vw",
              background: "rgba(255, 107, 107, 0.1)",
              border: "1px solid #ff6b6b",
              borderRadius: "8px",
              color: "#ff6b6b",
              textAlign: "center",
              width: "100%",
            }}
          >
            {error}
          </div>
        )}

        {/* Debug panel - only visible during development */}
        <DebugPanel />

        {auctionDetails.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3vw",
              background: "#1e1e1e",
              borderRadius: "12px",
              width: "100%",
            }}
          >
            <p>
              You haven't placed any bids yet or we couldn't retrieve your bids.
            </p>
            <p style={{ marginTop: "1vw", fontSize: "14px", color: "#aaa" }}>
              Make sure you're connected with the same wallet you used to place
              bids.
            </p>
            <Link
              to="/"
              style={{
                display: "inline-block",
                marginTop: "1.5vw",
                backgroundColor: "#007bff",
                color: "white",
                padding: "1vw 2vw",
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
              gridTemplateColumns: "repeat(auto-fill, minmax(30vw, 1fr))",
              gap: "2vw",
              width: "100%",
            }}
          >
            {auctionDetails.map((auction) => (
              <div
                key={auction.id}
                style={{
                  background: "#1e1e1e",
                  borderRadius: "12px",
                  padding: "2vw",
                  boxShadow: "0 4px 20px rgba(255,255,255,0.05)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {auction.highestBidder.toLowerCase() ===
                  account.toLowerCase() && (
                  <div
                    style={{
                      position: "absolute",
                      top: "1vw",
                      right: "1vw",
                      background: "#28a745",
                      color: "white",
                      padding: "0.5vw 1vw",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    Highest Bidder
                  </div>
                )}

                <h3 style={{ marginBottom: "1.5vw", color: "#fff" }}>
                  {auction.name}
                </h3>
                <p
                  style={{
                    color: "#bbb",
                    marginBottom: "1vw",
                    height: "4vw",
                    overflow: "hidden",
                  }}
                >
                  {auction.description}
                </p>
                <div style={{ marginBottom: "0.5vw" }}>
                  <span style={{ color: "#aaa" }}>Starting Price: </span>
                  <span style={{ color: "#fff" }}>
                    {auction.startingPrice} ETH
                  </span>
                </div>
                <div style={{ marginBottom: "0.5vw" }}>
                  <span style={{ color: "#aaa" }}>Current Bid: </span>
                  <span style={{ color: "#fff", fontWeight: "bold" }}>
                    {auction.highestBid} ETH
                  </span>
                </div>
                <div style={{ marginBottom: "1.5vw" }}>
                  <span style={{ color: "#aaa" }}>Ends: </span>
                  <span style={{ color: "#fff" }}>{auction.endTime}</span>
                </div>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Link
                    to={`/auction/${auction.id}`}
                    style={{
                      backgroundColor: "#007bff",
                      color: "white",
                      padding: "0.8vw 1.5vw",
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
                        padding: "0.8vw 1.5vw",
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

        <div style={{ marginTop: "3vw", textAlign: "center", width: "100%" }}>
          <Link
            to="/"
            style={{
              display: "inline-block",
              backgroundColor: "#6c757d",
              color: "white",
              padding: "1vw 2vw",
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
    </div>
  );
};

export default MyBids;
