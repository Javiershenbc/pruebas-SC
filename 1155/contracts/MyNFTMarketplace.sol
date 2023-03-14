// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";


contract MyNFTMarketplace is ERC1155, ERC1155Burnable, Ownable {
    struct Token {
        uint256 tokenId;
        uint256 price;
        bool forSale;
        address payable creator;
    }

    struct LoyaltyProgram {
        uint256 threshold;
        uint256 loyaltyPercent;
    }

    mapping (uint256 => Token) public _tokens;
    mapping (address => bool) private _users;
    mapping (uint256 => LoyaltyProgram) public _loyaltyPrograms;

    constructor() ERC1155("https://example.com/token/{id}.json") {}

    function mint(address to, uint256 tokenId, uint256 amount, string memory uri, address payable creator) public onlyOwner {
        _mint(to, tokenId, amount, "");
        _tokens[tokenId] = Token(tokenId, 0, false, creator);
        _setURI(uri);
    }

    function buy(address payable seller, uint256 tokenId) public payable {
        Token storage token = _tokens[tokenId];
        require(token.forSale, "Token is not for sale");
        require(msg.value == token.price, "Incorrect payment amount");

        // address payable seller = payable(owner(tokenId));
        address payable creator = token.creator;
        uint256 loyaltyFee = calculateLoyaltyFee(msg.value, creator, tokenId);

        // Transfer the token to the buyer
        _safeTransferFrom(seller, msg.sender, tokenId, 1, "");

        // Update the token state
        token.forSale = false;
        token.price = 0;
        //use safemath
        uint256 seller_price=msg.value-loyaltyFee;
        // Pay the seller and the creator
        seller.transfer(seller_price);
        creator.transfer(loyaltyFee);
    }

    function sell(uint256 tokenId, uint256 price) public {
        Token storage token = _tokens[tokenId];
        require(token.tokenId != 0, "Token does not exist");
        require(balanceOf(msg.sender, tokenId) >= 1, "You do not own this token");

        token.forSale = true;
        token.price = price;
        setApprovalForAll(address(this), true);
    }
    
    function setLoyaltyProgram(uint256 threshold, uint256 loyaltyPercent) public {
        _loyaltyPrograms[threshold] = LoyaltyProgram(threshold, loyaltyPercent);
    }

    function removeLoyaltyProgram(uint256 threshold) public {
        delete _loyaltyPrograms[threshold];
    }

    function calculateLoyaltyFee(uint256 amount, address creator, uint256 tokenId) private view returns (uint256) {
        LoyaltyProgram memory loyaltyProgram = _loyaltyPrograms[tokenId];

        if (loyaltyProgram.threshold == 0 || !isUser(creator) || amount < loyaltyProgram.threshold) {
            return 0;
        }
        //use safemath

        uint256 loyaltyFeeAmount = amount*loyaltyProgram.loyaltyPercent/100;
        
        return loyaltyFeeAmount;
    }

    function addUsers(address[] memory users) public onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            _users[users[i]] = true;
        }
    }

    function removeUsers(address[] memory users) public onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            _users[users[i]] = false;
        }
    }

    function isUser(address user) public view returns (bool) {
        return _users[user];
    }
}
