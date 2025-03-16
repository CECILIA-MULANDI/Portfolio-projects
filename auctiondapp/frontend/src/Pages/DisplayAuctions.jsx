import { useState, useEffect, useContext } from "react";
import {
  getAuctionDetails,
  endAuction,
  withdrawFunds,
  getAuctionCount,
} from "../components/AuctionContractFunctions";
import { useNavigate } from "react-router-dom";
import { Web3Context } from "../context/Web3Context";

const AuctionList = () => {
  const { provider, signer, account, connectWallet, isConnecting } =
    useContext(Web3Context);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Custom hook for responsive design
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

  // Check if screen is small (mobile) or very small
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const isVerySmallScreen = useMediaQuery("(max-width: 480px)");

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
        console.log("Auction Count:", auctionCount); // Debug log
        const auctionPromises = [];

        // Create an array of promises for fetching all auction details
        for (let id = 0; id < auctionCount; id++) {
          auctionPromises.push(
            getAuctionDetails(provider, id)
              .then((details) => {
                // Skip auctions with null address
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
        console.log("Valid Auctions:", validAuctions); // Debug log

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
        setError(
          "Wallet connected but signer not available. Please try again."
        );
        return;
      }

      const result = await endAuction(signer, auctionId);
      if (result.success) {
        // Show temporary success status and reload after delay
        alert("Auction ended successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError(result.message || "Failed to end auction");
      }
    } catch (err) {
      console.error("Error ending auction:", err);
      setError(
        err.message || "Failed to end auction. See console for details."
      );
    }
  };

  const handleWithdrawFunds = async () => {
    try {
      if (!(await ensureWalletConnected())) return;

      if (!signer) {
        setError(
          "Wallet connected but signer not available. Please try again."
        );
        return;
      }

      const result = await withdrawFunds(signer);
      if (result.success) {
        alert(result.message || "Withdrawal successful!");
      } else {
        setError(result.message || "Failed to withdraw funds");
      }
    } catch (err) {
      console.error("Error withdrawing funds:", err);
      setError(
        err.message || "Failed to withdraw funds. See console for details."
      );
    }
  };

  const handlePlaceBid = async (auctionId) => {
    if (!(await ensureWalletConnected())) return;
    navigate(`/place-bid/${auctionId}`);
  };

  // Root wrapper style to ensure full width background
  const rootWrapperStyle = {
    width: "100vw",
    minHeight: "100vh",
    margin: 0,
    padding: 0,
    backgroundColor: "#121212",
    position: "relative",
    boxSizing: "border-box",
    overflow: "hidden", // Prevent horizontal scroll
  };

  // Define styles for responsive layout
  const containerStyle = {
    textAlign: "center",
    padding: isSmallScreen ? "10px" : "20px",
    color: "#fff",
    margin: "0 auto", // Center content
    maxWidth: "100%",
    boxSizing: "border-box",
  };

  const titleStyle = {
    textAlign: "center",
    marginBottom: "20px",
    color: "#fff",
    fontSize: isVerySmallScreen ? "1.5rem" : "2rem",
    paddingLeft: isSmallScreen ? "10px" : "0",
    paddingRight: isSmallScreen ? "10px" : "0",
  };

  const auctionGridStyle = {
    display: "flex",
    flexWrap: "nowrap", // Default to horizontal scrolling on large screens
    overflowX: "auto", // Allow horizontal scrolling
    gap: isSmallScreen ? "10px" : "20px",
    padding: isSmallScreen ? "5px" : "10px",
    WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
    scrollbarWidth: "thin", // For Firefox
    msOverflowStyle: "none", // For IE and Edge
  };

  // Adjust styles based on screen size
  const responsiveGridStyle = {
    ...auctionGridStyle,
    flexWrap: isSmallScreen ? "wrap" : "nowrap",
    justifyContent: isSmallScreen ? "center" : "flex-start",
    overflowX: isSmallScreen ? "visible" : "auto",
  };

  const cardStyle = {
    border: "1px solid #333",
    borderRadius: "12px",
    padding: isSmallScreen ? "15px" : "20px",
    backgroundColor: "#1e1e1e",
    color: "white",
    boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
    textAlign: "left",
    width: isSmallScreen
      ? isVerySmallScreen
        ? "calc(100% - 20px)"
        : "calc(100% - 30px)"
      : "300px",
    minHeight: isSmallScreen ? "350px" : "380px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    flexShrink: 0, // Prevent cards from shrinking in horizontal mode
    marginBottom: isSmallScreen ? "20px" : "0", // Add bottom margin on small screens
    fontSize: isVerySmallScreen ? "0.9rem" : "1rem",
  };

  // Show connection status if connected
  const statusStyle = {
    margin: "0 0 20px 0",
    padding: isSmallScreen ? "6px 12px" : "8px 15px",
    backgroundColor: "rgba(40, 167, 69, 0.2)",
    color: "#75b798",
    borderRadius: "8px",
    display: "inline-block",
    border: "1px solid rgba(40, 167, 69, 0.3)",
    fontSize: isVerySmallScreen ? "0.8rem" : "1rem",
  };

  const errorStyle = {
    backgroundColor: "rgba(220, 53, 69, 0.2)",
    color: "#ff6b6b",
    padding: isSmallScreen ? "10px" : "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid rgba(220, 53, 69, 0.3)",
    maxWidth: "100%",
    wordBreak: "break-word", // Ensure long error messages don't break layout
  };

  const buttonStyle = {
    padding: isSmallScreen ? "10px" : "12px",
    border: "none",
    borderRadius: "8px",
    fontSize: isVerySmallScreen ? "0.9rem" : "1rem",
    cursor: "pointer",
    transition: "0.3s",
    fontWeight: "bold",
    width: "100%",
    marginTop: "10px",
    touchAction: "manipulation", // Better touch behavior
  };

  const withdrawButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#28a745",
    color: "white",
    width: isSmallScreen ? "100%" : "auto",
    padding: isSmallScreen ? "10px" : "12px 20px",
    maxWidth: isSmallScreen ? "300px" : "none",
    margin: isSmallScreen ? "0 auto" : "0",
  };

  return (
    <div style={rootWrapperStyle}>
      <div style={containerStyle}>
        {account && (
          <div style={statusStyle}>
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </div>
        )}

        <h2 style={titleStyle}>Active Auctions</h2>

        {error && (
          <div style={errorStyle}>
            <p>{error}</p>
            <button
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              style={{
                ...buttonStyle,
                backgroundColor: "#007bff",
                color: "white",
                marginTop: "10px",
                maxWidth: isSmallScreen ? "200px" : "none",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <p>Loading auctions...</p>
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
                  <h3
                    style={{
                      marginTop: "0",
                      fontSize: isVerySmallScreen ? "1.2rem" : "1.5rem",
                    }}
                  >
                    {auction.name}
                  </h3>
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
                      ...buttonStyle,
                      backgroundColor: "#007bff",
                      color: "white",
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = "#0056b3")
                    }
                    onFocus={(e) =>
                      (e.target.style.backgroundColor = "#0056b3")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = "#007bff")
                    }
                    onBlur={(e) => (e.target.style.backgroundColor = "#007bff")}
                  >
                    Place Bid
                  </button>
                  <button
                    onClick={() => handleEndAuction(auction.id)}
                    style={{
                      ...buttonStyle,
                      backgroundColor: "#dc3545",
                      color: "white",
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = "#c82333")
                    }
                    onFocus={(e) =>
                      (e.target.style.backgroundColor = "#c82333")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = "#dc3545")
                    }
                  >
                    End Auction
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <hr
          style={{
            margin: isSmallScreen ? "20px 0" : "30px 0",
            borderColor: "#333",
            width: "100%",
          }}
        />

        <h2 style={titleStyle}>Account Actions</h2>
        <button
          onClick={handleWithdrawFunds}
          style={withdrawButtonStyle}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#218838")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}
        >
          Withdraw Funds
        </button>
      </div>
    </div>
  );
};

export default AuctionList;
