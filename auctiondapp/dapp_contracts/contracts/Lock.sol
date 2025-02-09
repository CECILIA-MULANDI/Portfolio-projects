// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract AuctionContract {
    struct Auction {
        uint256 id;
        string name;
        address payable seller;
        string description;
        uint256 startingPrice;
        uint256 highestBid;
        address payable highestBidder;
        uint256 endTime;
        bool ended;
    }

    // State variables
    mapping(uint256 => Auction) public auctions;
    mapping(address => uint256) public pendingReturns;
    uint256 public auctionCounter;
    bool public stopped;
    address public owner;
    uint256 public constant MINIMUM_INCREMENT = 0.1 ether;

    // Events
    event AuctionCreated(
        uint256 indexed auctionId,
        string title,
        uint256 startingPrice,
        uint256 endTime
    );
    event BidPlaced(uint256 indexed auctionId, address bidder, uint256 amount);
    event AuctionEnded(
        uint256 indexed auctionId,
        address winner,
        uint256 amount
    );
    event ContractStateToggled(bool stopped);
    event WithdrawalSuccessful(address indexed bidder, uint256 amount);

    // Modifiers
    modifier notStopped() {
        require(!stopped, "Contract is paused");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
        stopped = false;
    }

    function createAuction(
        string memory _name,
        uint256 _startingPrice,
        string memory _description,
        uint256 _duration
    ) external notStopped {
        require(_startingPrice > 0, "Price must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");

        uint256 auctionId = auctionCounter++;

        auctions[auctionId] = Auction({
            id: auctionId,
            name: _name,
            seller: payable(msg.sender),
            description: _description,
            startingPrice: _startingPrice,
            highestBid: 0,
            highestBidder: payable(address(0)),
            endTime: block.timestamp + _duration,
            ended: false
        });

        emit AuctionCreated(
            auctionId,
            _name,
            _startingPrice,
            block.timestamp + _duration
        );
    }

    function placeBid(uint256 _auctionId) external payable notStopped {
        Auction storage auction = auctions[_auctionId];

        require(!auction.ended, "Auction already ended");
        require(block.timestamp < auction.endTime, "Auction has expired");
        require(
            msg.sender != auction.seller,
            "Seller cannot bid on own auction"
        );
        require(msg.value >= auction.startingPrice, "Bid below starting price");

        // If there was a previous bid, add it to pending returns
        if (auction.highestBid != 0) {
            pendingReturns[auction.highestBidder] += auction.highestBid;
        }

        auction.highestBidder = payable(msg.sender);
        auction.highestBid = msg.value;

        emit BidPlaced(_auctionId, msg.sender, msg.value);
    }

    function endAuction(uint256 _auctionId) external notStopped {
        Auction storage auction = auctions[_auctionId];

        require(!auction.ended, "Auction already ended");
        require(
            msg.sender == auction.seller || msg.sender == owner,
            "Only seller or owner can end auction"
        );
        require(
            block.timestamp >= auction.endTime,
            "Auction cannot be ended before end time"
        );

        auction.ended = true;

        if (auction.highestBidder != address(0)) {
            // Transfer the highest bid to the seller
            (bool success, ) = auction.seller.call{value: auction.highestBid}(
                ""
            );
            require(success, "Transfer to seller failed");
        }

        emit AuctionEnded(
            _auctionId,
            auction.highestBidder,
            auction.highestBid
        );
    }

    function withdraw() external returns (bool) {
        uint256 amount = pendingReturns[msg.sender];
        require(amount > 0, "No funds to withdraw");

        pendingReturns[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            pendingReturns[msg.sender] = amount;
            return false;
        }

        emit WithdrawalSuccessful(msg.sender, amount);
        return true;
    }

    function getAuction(
        uint256 _auctionId
    )
        external
        view
        returns (
            address seller,
            string memory title,
            string memory description,
            uint256 startingPrice,
            uint256 highestBid,
            address highestBidder,
            uint256 endTime,
            bool ended
        )
    {
        Auction storage auction = auctions[_auctionId];
        return (
            auction.seller,
            auction.name,
            auction.description,
            auction.startingPrice,
            auction.highestBid,
            auction.highestBidder,
            auction.endTime,
            auction.ended
        );
    }

    function getPendingReturn(address bidder) external view returns (uint256) {
        return pendingReturns[bidder];
    }

    function toggleContractActive() external onlyOwner {
        stopped = !stopped;
        emit ContractStateToggled(stopped);
    }

    // Emergency withdraw function for contract owner
    function emergencyWithdraw() external onlyOwner {
        require(stopped, "Contract must be stopped to withdraw");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = owner.call{value: balance}("");
        require(success, "Emergency withdraw failed");
    }
}
