import { useState, useEffect, useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import {
  getAuctionDetails,
  endAuction,
  withdrawFunds,
  getAuctionCount,
} from "../components/AuctionContractFunctions";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";

const AuctionList = () => {
  const { provider, signer, account } = useContext(Web3Context);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingWithdraw, setPendingWithdraw] = useState(false);
  const [endingAuctionId, setEndingAuctionId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctions = async () => {
      if (!provider) {
        setError("Web3 provider not connected");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get the total number of auctions from the contract
        const totalAuctions = await getAuctionCount(provider);
        console.log(`Total auctions in contract: ${totalAuctions}`);

        if (totalAuctions === 0) {
          setAuctions([]);
          setLoading(false);
          return;
        }

        // Create an array of IDs to fetch
        const auctionIds = Array.from({ length: totalAuctions }, (_, i) => i);

        // Fetch all auctions in parallel with a batch size to prevent network overload
        const batchSize = 10;
        const auctionData = [];

        for (let i = 0; i < auctionIds.length; i += batchSize) {
          const batch = auctionIds.slice(i, i + batchSize);

          const batchPromises = batch.map(async (id) => {
            try {
              const details = await getAuctionDetails(provider, id);

              // Skip "empty" auctions (this is a safety check)
              if (details.seller === ethers.constants.AddressZero) {
                return null;
              }

              // Add extra properties for UI logic
              const currentTime = Math.floor(Date.now() / 1000);
              const endTimeUnix = new Date(details.endTime).getTime() / 1000;
              const isExpired = currentTime > endTimeUnix;

              return {
                ...details,
                id,
                isExpired,
                canEnd:
                  isExpired &&
                  !details.ended &&
                  details.seller.toLowerCase() ===
                    (account?.toLowerCase() || ""),
              };
            } catch (err) {
              console.warn(`Error fetching auction ${id}:`, err);
              return null;
            }
          });

          const batchResults = await Promise.all(batchPromises);
          auctionData.push(
            ...batchResults.filter((auction) => auction !== null)
          );
        }

        // Sort auctions: active first, then by end time (soonest ending first)
        const sortedAuctions = auctionData.sort((a, b) => {
          // First sort by ended status
          if (a.ended !== b.ended) {
            return a.ended ? 1 : -1;
          }

          // Then by expiration
          if (a.isExpired !== b.isExpired) {
            return a.isExpired ? 1 : -1;
          }

          // Then by end time
          const aTime = new Date(a.endTime).getTime();
          const bTime = new Date(b.endTime).getTime();
          return aTime - bTime;
        });

        setAuctions(sortedAuctions);
      } catch (err) {
        console.error("Error fetching auctions:", err);
        setError(
          "Failed to load auctions. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();

    // Set up an interval to refresh auction data periodically
    const refreshInterval = setInterval(fetchAuctions, 60000); // Refresh every minute

    return () => clearInterval(refreshInterval);
  }, [provider, account]);

  const handleEndAuction = async (auctionId) => {
    if (!signer) {
      alert("Please connect your wallet to end an auction");
      return;
    }

    try {
      setEndingAuctionId(auctionId);

      const result = await endAuction(signer, auctionId);

      if (result.success) {
        // Update the UI immediately to show the auction as ended
        setAuctions(
          auctions.map((auction) =>
            auction.id === auctionId ? { ...auction, ended: true } : auction
          )
        );

        alert("Auction ended successfully!");
      } else {
        alert(`Failed to end auction: ${result.message}`);
      }
    } catch (err) {
      console.error("Error ending auction:", err);
      alert("Failed to end auction. See console for details.");
    } finally {
      setEndingAuctionId(null);
    }
  };

  const handleWithdrawFunds = async () => {
    if (!signer) {
      alert("Please connect your wallet to withdraw funds");
      return;
    }

    try {
      setPendingWithdraw(true);
      const result = await withdrawFunds(signer);

      if (result.success) {
        alert(result.message);
      } else {
        alert(`Failed to withdraw: ${result.message}`);
      }
    } catch (err) {
      console.error("Error withdrawing funds:", err);
      alert("Failed to withdraw funds. See console for details.");
    } finally {
      setPendingWithdraw(false);
    }
  };

  const handleViewDetails = (auctionId) => {
    navigate(`/auction/${auctionId}`);
  };

  // Media query hook
  const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(
      window.matchMedia ? window.matchMedia(query).matches : false
    );

    useEffect(() => {
      if (!window.matchMedia) return;

      const media = window.matchMedia(query);
      const listener = () => setMatches(media.matches);

      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }, [query]);

    return matches;
  };

  // Check if screen is small (mobile)
  const isSmallScreen = useMediaQuery("(max-width: 768px)");

  // Styles
  const styles = {
    container: {
      textAlign: "center",
      padding: "20px",
      maxWidth: "1200px",
      margin: "0 auto",
    },
    title: {
      textAlign: "center",
      width: "100%",
      marginBottom: "20px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: isSmallScreen
        ? "1fr"
        : "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "20px",
      padding: "10px",
    },
    card: {
      border: "1px solid #ddd",
      borderRadius: "10px",
      padding: "20px",
      backgroundColor: "#343a40",
      color: "white",
      boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
      textAlign: "left",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      position: "relative",
    },
    expired: {
      opacity: 0.7,
    },
    ended: {
      opacity: 0.5,
    },
    statusBadge: {
      position: "absolute",
      top: "10px",
      right: "10px",
      padding: "5px 10px",
      borderRadius: "15px",
      fontSize: "12px",
      fontWeight: "bold",
    },
    activeBadge: {
      backgroundColor: "#28a745",
      color: "white",
    },
    expiredBadge: {
      backgroundColor: "#ffc107",
      color: "black",
    },
    endedBadge: {
      backgroundColor: "#dc3545",
      color: "white",
    },
    button: {
      padding: "10px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      width: "100%",
      marginTop: "10px",
      fontWeight: "bold",
    },
    bidButton: {
      backgroundColor: "#007bff",
      color: "white",
    },
    endButton: {
      backgroundColor: "#dc3545",
      color: "white",
    },
    detailsButton: {
      backgroundColor: "#6c757d",
      color: "white",
    },
    withdrawButton: {
      backgroundColor: "#28a745",
      color: "white",
      padding: "10px 20px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      marginTop: "20px",
    },
    loadingOverlay: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "50px",
    },
    errorContainer: {
      color: "red",
      margin: "20px 0",
      padding: "20px",
      border: "1px solid red",
      borderRadius: "5px",
      backgroundColor: "rgba(255, 0, 0, 0.1)",
    },
    retryButton: {
      backgroundColor: "#007bff",
      color: "white",
      padding: "10px",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      marginTop: "10px",
    },
    emptyState: {
      padding: "50px",
      textAlign: "center",
      color: "#6c757d",
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Auction Marketplace</h2>

      {loading ? (
        <div style={styles.loadingOverlay}>
          <p>Loading auctions...</p>
        </div>
      ) : error ? (
        <div style={styles.errorContainer}>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={styles.retryButton}
          >
            Retry
          </button>
        </div>
      ) : auctions.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No auctions found. Be the first to create an auction!</p>
          <button
            onClick={() => navigate("/create-auction")}
            style={{
              ...styles.button,
              ...styles.bidButton,
              width: "auto",
              padding: "10px 20px",
              marginTop: "20px",
            }}
          >
            Create Auction
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {auctions.map((auction) => {
            const isActive = !auction.ended && !auction.isExpired;
            const isEnded = auction.ended;
            const isExpired = !auction.ended && auction.isExpired;

            let cardStyle = { ...styles.card };
            if (isEnded) cardStyle = { ...cardStyle, ...styles.ended };
            else if (isExpired) cardStyle = { ...cardStyle, ...styles.expired };

            return (
              <div key={auction.id} style={cardStyle}>
                {/* Status Badge */}
                <div
                  style={{
                    ...styles.statusBadge,
                    ...(isActive
                      ? styles.activeBadge
                      : isExpired
                      ? styles.expiredBadge
                      : styles.endedBadge),
                  }}
                >
                  {isActive ? "Active" : isExpired ? "Expired" : "Ended"}
                </div>

                <div>
                  <h3 style={{ marginTop: "0" }}>{auction.name}</h3>
                  <p
                    style={{
                      height: "40px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {auction.description.length > 100
                      ? `${auction.description.substring(0, 100)}...`
                      : auction.description}
                  </p>
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
                    onClick={() => handleViewDetails(auction.id)}
                    style={{ ...styles.button, ...styles.detailsButton }}
                  >
                    View Details
                  </button>

                  {!auction.ended && (
                    <button
                      onClick={() => navigate(`/place-bid/${auction.id}`)}
                      style={{ ...styles.button, ...styles.bidButton }}
                      disabled={auction.isExpired}
                    >
                      Place Bid
                    </button>
                  )}

                  {auction.isExpired && !auction.ended && (
                    <button
                      onClick={() => handleEndAuction(auction.id)}
                      style={{ ...styles.button, ...styles.endButton }}
                      disabled={endingAuctionId === auction.id}
                    >
                      {endingAuctionId === auction.id
                        ? "Ending..."
                        : "End Auction"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <hr style={{ margin: "30px 0" }} />
      <h2 style={styles.title}>Account Actions</h2>

      <button
        onClick={handleWithdrawFunds}
        style={styles.withdrawButton}
        disabled={pendingWithdraw || !signer}
      >
        {pendingWithdraw ? "Processing..." : "Withdraw Funds"}
      </button>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => navigate("/create-auction")}
          style={{
            ...styles.button,
            ...styles.bidButton,
            width: "auto",
            padding: "10px 20px",
          }}
        >
          Create New Auction
        </button>

        <button
          onClick={() => navigate("/my-bids")}
          style={{
            ...styles.button,
            ...styles.detailsButton,
            width: "auto",
            padding: "10px 20px",
            marginLeft: "10px",
          }}
        >
          My Bids
        </button>
      </div>
    </div>
  );
};

export default AuctionList;
