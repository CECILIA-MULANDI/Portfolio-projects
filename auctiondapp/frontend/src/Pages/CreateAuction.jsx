import { useState, useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import { createAuction } from "../components/AuctionContractFunctions";

const CreateAuction = () => {
  const { signer } = useContext(Web3Context);
  const [auctionData, setAuctionData] = useState({
    name: "",
    startingPrice: "",
    description: "",
    duration: "",
  });

  const handleChange = (e) => {
    setAuctionData({
      ...auctionData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createAuction(
      signer,
      auctionData.name,
      auctionData.startingPrice,
      auctionData.description,
      auctionData.duration
    );
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
        minHeight: "100vh", // Ensures full viewport height
        width: "100vw", // Ensures full viewport width
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
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column" }}
        >
          {Object.keys(auctionData).map((field) => (
            <input
              key={field}
              type="text"
              name={field}
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
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
          >
            Create Auction
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAuction;
