// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {ReentrancyGuard} from '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

contract EcoChainMarketplace is ReentrancyGuard {
  struct Listing {
    address seller;
    uint256 amount;
    uint256 price;
    bool active;
  }

  IERC20 public immutable carbonCreditToken;
  uint256 public nextListingId;
  mapping(uint256 => Listing) public listings;

  event CreditListed(uint256 indexed listingId, address indexed seller, uint256 amount, uint256 price);
  event CreditBought(uint256 indexed listingId, address indexed buyer, uint256 amount, uint256 price);
  event ListingCanceled(uint256 indexed listingId, address indexed seller);

  constructor(address tokenAddress) {
    require(tokenAddress != address(0), 'Invalid token address');
    carbonCreditToken = IERC20(tokenAddress);
  }

  function listCredits(uint256 amount, uint256 price) external returns (uint256 listingId) {
    require(amount > 0, 'Amount must be greater than 0');
    require(price > 0, 'Price must be greater than 0');

    listingId = nextListingId++;
    listings[listingId] = Listing({
      seller: msg.sender,
      amount: amount,
      price: price,
      active: true
    });

    emit CreditListed(listingId, msg.sender, amount, price);
  }

  function buyCredits(uint256 listingId) external payable nonReentrant {
    Listing storage listing = listings[listingId];
    require(listing.active, 'Listing is not active');
    require(msg.value == listing.price, 'Incorrect payment amount');

    listing.active = false;

    require(carbonCreditToken.transferFrom(listing.seller, msg.sender, listing.amount), 'Token transfer failed');

    (bool sent, ) = payable(listing.seller).call{value: msg.value}('');
    require(sent, 'Payment transfer failed');

    emit CreditBought(listingId, msg.sender, listing.amount, listing.price);
  }

  function cancelListing(uint256 listingId) external {
    Listing storage listing = listings[listingId];
    require(listing.active, 'Listing is not active');
    require(listing.seller == msg.sender, 'Only seller can cancel');

    listing.active = false;
    emit ListingCanceled(listingId, msg.sender);
  }
}
