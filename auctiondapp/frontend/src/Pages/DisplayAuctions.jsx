import { useState, useEffect } from "react";
import {
  getAuctionDetails,
  endAuction,
  withdrawFunds,
  getAuctionCount,
} from "../components/AuctionContractFunctions";
import { useNavigate } from "react-router-dom";
import useWallet from "../components/ConnectWallet";

const AuctionList = () => {
  const { provider, signer, account, connectWallet, isConnecting } =
    useWallet();
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
        // Get the total number of auctions from the contract
        const auctionCount = await getAuctionCount(provider);
        const auctionPromises = [];

        // Create an array of promises for fetching all auction details
        for (let id = 0; id < auctionCount; id++) {
          auctionPromises.push(
            getAuctionDetails(provider, id)
              .then((details) => {
                // Skip auctions with null address (shouldn't happen with proper counting)
                if (
                  details &&
                  details.seller !==
                    "0x0000000000000000000000000000000000000000"
                ) {
                  return { ...details, id };
                }
                return null;
              })
              .catch((err) => {
                console.error(`Error fetching auction ${id}:`, err);
                return null;
              })
          );
        }

        // Wait for all promises to resolve
        const results = await Promise.all(auctionPromises);

        // Filter out any null results (failed fetches or empty auctions)
        const validAuctions = results.filter((auction) => auction !== null);

        setAuctions(validAuctions);
      } catch (err) {
        console.error("Error fetching auctions:", err);
        setError("Failed to fetch auctions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [provider]);

  // Ensure wallet is connected before performing actions
  const ensureWalletConnected = async () => {
    if (!account && !isConnecting) {
      const confirmed = window.confirm(
        "Please connect your wallet to continue. Connect now?"
      );
      if (confirmed) {
        await connectWallet();
        return !!account;
      }
      return false;
    }
    return true;
  };

  const handleEndAuction = async (auctionId) => {
    try {
      if (!(await ensureWalletConnected())) return;

      if (!signer) {
        alert("Wallet connected but signer not available. Please try again.");
        return;
      }

      await endAuction(signer, auctionId);
      alert("Auction end requested. Please wait for transaction confirmation.");
      window.location.reload();
    } catch (err) {
      console.error("Error ending auction:", err);
      alert("Failed to end auction. See console for details.");
    }
  };

  const handleWithdrawFunds = async () => {
    try {
      if (!(await ensureWalletConnected())) return;

      if (!signer) {
        alert("Wallet connected but signer not available. Please try again.");
        return;
      }

      await withdrawFunds(signer);
      alert("Withdrawal requested. Please wait for transaction confirmation.");
    } catch (err) {
      console.error("Error withdrawing funds:", err);
      alert("Failed to withdraw funds. See console for details.");
    }
  };

  const handlePlaceBid = async (auctionId) => {
    if (!(await ensureWalletConnected())) return;
    navigate(`/place-bid/${auctionId}`);
  };

  // Define styles for responsive layout
  const containerStyle = {
    textAlign: "center",
    padding: "20px",
  };

  const titleStyle = {
    textAlign: "center",
    width: "100%",
    marginBottom: "20px",
  };

  const auctionGridStyle = {
    display: "flex",
    flexWrap: "nowrap", // Default to horizontal scrolling on large screens
    overflowX: "auto", // Allow horizontal scrolling
    gap: "20px",
    padding: "10px",
  };

  // Media query styles handled in-line
  // We'll check window width and apply different styles

  const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
      const media = window.matchMedia(query);
      if (media.matches !== matches) {
        setMatches(media.matches);
      }

      const listener = () => setMatches(media.matches);
      media.addEventListener("change", listener);

      return () => media.removeEventListener("change", listener);
    }, [matches, query]);

    return matches;
  };

  // Check if screen is small (mobile)
  const isSmallScreen = useMediaQuery("(max-width: 768px)");

  // Adjust styles based on screen size
  const responsiveGridStyle = {
    ...auctionGridStyle,
    flexWrap: isSmallScreen ? "wrap" : "nowrap",
    justifyContent: isSmallScreen ? "center" : "flex-start",
    overflowX: isSmallScreen ? "visible" : "auto",
  };

  const cardStyle = {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "20px",
    backgroundColor: "#343a40",
    color: "white",
    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
    textAlign: "left",
    width: isSmallScreen ? "calc(100% - 40px)" : "300px",
    minHeight: "380px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    flexShrink: 0, // Prevent cards from shrinking in horizontal mode
  };

  // Show connection status if connected
  const statusStyle = {
    margin: "0 0 20px 0",
    padding: "8px 15px",
    backgroundColor: "#28a745",
    color: "white",
    borderRadius: "5px",
    display: "inline-block",
  };

  return (
    <div style={containerStyle}>
      {account && (
        <div style={statusStyle}>
          Connected: {account.slice(0, 6)}...{account.slice(-4)}
        </div>
      )}

      <h2 style={titleStyle}>Active Auctions</h2>

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
        <div style={responsiveGridStyle}>
          {auctions.map((auction) => (
            <div key={auction.id} style={cardStyle}>
              <div>
                <h3 style={{ marginTop: "0" }}>{auction.name}</h3>
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
              </div>

              <div>
                <button
                  onClick={() => handlePlaceBid(auction.id)}
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
                  onClick={() => handleEndAuction(auction.id)}
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
            </div>
          ))}
        </div>
      )}

      <hr style={{ margin: "30px 0" }} />
      <h2 style={titleStyle}>Account Actions</h2>
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
