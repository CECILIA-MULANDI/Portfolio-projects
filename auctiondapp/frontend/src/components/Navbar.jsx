import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Web3Context } from "../context/Web3Context";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { account, connectWallet } = useContext(Web3Context);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav
      style={{
        backgroundColor: "#007bff",
        padding: "15px 25px",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "fixed",
        top: 0,
        width: "97%",
        boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
        zIndex: 50,
      }}
    >
      <h1 style={{ fontSize: "20px", fontWeight: "bold" }}>Auction Platform</h1>

      {/* Center buttons - visible on desktop */}
      <div className="center-menu">
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to="/auctions" className="nav-link">
          Auctions
        </Link>
        <Link to="/create-auction" className="nav-link">
          Create Auction
        </Link>
      </div>

      {/* Right section with connect button and hamburger */}
      <div className="right-section">
        <div className="connect-wallet-container">
          {account ? (
            <div className="connected-address">
              Connected: {account.substring(0, 6)}...{account.slice(-4)}
            </div>
          ) : (
            <button className="connect-button" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
        <button onClick={toggleMenu} className="menu-button">
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu that shows/hides */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="nav-link" onClick={toggleMenu}>
            Home
          </Link>
          <Link to="/auctions" className="nav-link" onClick={toggleMenu}>
            Auctions
          </Link>
          <Link to="/create-auction" className="nav-link" onClick={toggleMenu}>
            Create Auction
          </Link>
          {!account && (
            <button
              className="mobile-connect-button"
              onClick={() => {
                connectWallet();
                toggleMenu();
              }}
            >
              Connect Wallet
            </button>
          )}
        </div>
      )}

      <style>{`
        .center-menu {
          display: flex;
          justify-content: center;
          flex-grow: 1;
        }
        
        .right-section {
          display: flex;
          align-items: center;
        }
        
        .connect-wallet-container {
          margin-right: 15px;
        }
        
        .connect-button {
          padding: 8px 15px;
          background-color: white;
          color: #007bff;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0px 2px 4px rgba(0,0,0,0.1);
        }
        
        .connected-address {
          padding: 8px 15px;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          font-size: 14px;
          box-shadow: 0px 2px 4px rgba(0,0,0,0.1);
        }
        
        .mobile-connect-button {
          padding: 10px 35px;
          background-color: white;
          color: #007bff;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          width: 95%;
          box-shadow: 0px 2px 4px rgba(0,0,0,0.1);
        }
        
        .nav-link {
          padding: 10px 15px;
          background-color: white;
          color: #007bff;
          border-radius: 8px;
          box-shadow: 0px 4px 6px rgba(0,0,0,0.1);
          text-decoration: none;
          margin: 5px;
        }
        
        .menu-button {
          display: none;
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
        }
        
        .mobile-menu {
          display: none;
        }
        
        @media (max-width: 768px) {
          .center-menu {
            display: none;
          }
          
          .menu-button {
            display: block;
          }
          
          .mobile-menu {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 60px;
            right: 0;
            left: 0;
            background-color: #007bff;
            padding: 30px;
            box-shadow: 0px 4px 6px rgba(0,0,0,0.1);
            z-index: 49;
            align-items: center;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
