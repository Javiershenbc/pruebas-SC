// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract NFTMarketplace {
    using SafeMath for uint256;

    // NFT contract
    IERC721Metadata public nftContract;

    // Mapping from tokenId to price and owner
    mapping (uint256 => uint256) public tokenPrice;
    mapping (uint256 => address) public tokenOwner;

    // Event for when an NFT is listed
    event NFTListed(uint256 indexed tokenId, uint256 price, address indexed owner);

    // Event for when an NFT is sold
    event NFTSold(uint256 indexed tokenId, uint256 price, address indexed buyer, address indexed seller);

    constructor(IERC721Metadata _nftContract) {
        nftContract = _nftContract;
    }

    // List an NFT for sale at a specified price
    function listNFT(uint256 tokenId, uint256 price) public {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Only NFT owner can list");
        require(price > 0, "Price must be greater than zero");

        tokenPrice[tokenId] = price;
        tokenOwner[tokenId] = msg.sender;
        nftContract.setApprovalForAll(address(this), true);
  
        emit NFTListed(tokenId, price, msg.sender);
    }

    // Remove an NFT from the marketplace
    function unlistNFT(uint256 tokenId) public {
        require(tokenOwner[tokenId] == msg.sender, "Only NFT owner can unlist");

        delete tokenPrice[tokenId];
        delete tokenOwner[tokenId];

        emit NFTListed(tokenId, 0, address(0));
    }

    // Buy an NFT from the marketplace
    function buyNFT(uint256 tokenId) public payable {
        address seller = tokenOwner[tokenId];
        uint256 price = tokenPrice[tokenId];

        require(price > 0, "NFT not listed for sale");
        require(msg.value >= price, "Insufficient funds");
        require(seller != msg.sender, "Cannot buy your own NFT");

        // Transfer ownership of NFT to buyer
        nftContract.transferFrom(seller, msg.sender, tokenId);

        // Transfer funds to seller
        payable(seller).transfer(price);

        // Update mapping
        delete tokenPrice[tokenId];
        delete tokenOwner[tokenId];
        
        emit NFTSold(tokenId, price, msg.sender, seller);
    }
}
