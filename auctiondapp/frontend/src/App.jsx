import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Web3Provider } from "./context/Web3Context"; // Import Web3Provider
import HomePage from "./Pages/HomePage";
import AuctionList from "./Pages/DisplayAuctions";
import CreateAuction from "./Pages/CreateAuction";
import Navbar from "./components/Navbar";
import PlaceBid from "./Pages/PlaceBids";
import MyBids from "./Pages/MyBids";
const App = () => {
  return (
    <Web3Provider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auctions" element={<AuctionList />} />
          <Route path="/create-auction" element={<CreateAuction />} />
          <Route path="/place-bid/:auctionId" element={<PlaceBid />} />
          <Route path="/my-bids" element={<MyBids />} />
        </Routes>
      </Router>
    </Web3Provider>
  );
};

export default App;
