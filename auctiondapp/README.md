# Auction Smart Contract

## Overview

A decentralized auction system where users can create auctions, bid securely, and withdraw funds. The contract ensures fair bidding, automatic refunds, and secure finalization.

## Features

- **Auction Creation**: Sellers list items with a starting price and duration.
- **Bidding**: Users place bids, with automatic refunds for outbid bidders.
- **Auction Finalization**: Sellers or the owner can end auctions after expiry.
- **Withdrawals**: Users can claim refunds securely.
- **Contract Management**: The owner can pause operations and perform emergency withdrawals.

## Key Functions

- **createAuction** – Creates a new auction.
- **placeBid** – Places a bid, ensuring it’s higher than the previous one.
- **endAuction** – Transfers the highest bid to the seller after auction expiry.
- **withdraw** – Allows users to retrieve their pending refunds.
- **toggleContractActive** – Enables/disables contract operations.

## Usage

1. Deploy the contract on an Ethereum-compatible network.
2. Create an auction with a name, description, starting price, and duration.
3. Users bid, and previous highest bidders are refunded automatically.
4. The auction owner finalizes the auction and receives the highest bid.
5. Unsuccessful bidders can withdraw their funds.

## Frontend

A sample frontend is available for easy interaction with the contract, allowing users to create, bid, and finalize auctions seamlessly.

## Future Enhancements

- Support for NFT auctions.
- Dutch & Sealed-Bid auctions.
- IPFS integration for asset storage.

## License

Licensed under **MIT License**.
