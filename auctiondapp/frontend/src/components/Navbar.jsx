import { useState } from "react";
import { Link } from "react-router-dom"; // Import Link

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      style={{
        backgroundColor: "#007bff",
        padding: "15px 20px",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "fixed",
        top: 0,
        width: "100%",
        boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
        zIndex: 50,
      }}
    >
      <h1 style={{ fontSize: "20px", fontWeight: "bold" }}>Auction Platform</h1>
      <div className="menu-container">
        <div className="menu desktop-menu">
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
        <button onClick={() => setMenuOpen(!menuOpen)} className="menu-button">
          &#9776;
        </button>
      </div>
      <div className={`menu mobile-menu ${menuOpen ? "open" : ""}`}>
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
      <style>{`
        .menu-container {
          display: flex;
          align-items: center;
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
        
        @media (min-width: 769px) {
          .desktop-menu {
            display: flex;
            flex-direction: row;
          }
          .menu-button, .mobile-menu {
            display: none;
          }
        }
        
        @media (max-width: 768px) {
          .desktop-menu {
            display: none;
          }
          .menu-button {
            display: block;
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            margin-left: 20px;
          }
          .mobile-menu {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 60px;
            right: 20px;
            background-color: #007bff;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0px 4px 6px rgba(0,0,0,0.1);
          }
          .mobile-menu.open {
            display: flex;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
