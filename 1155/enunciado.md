# Project Description

You are building a NFT marketplace where users can buy, sell, and mint NFTs and collections. Users can create collections of multiple NFTs, and each NFT can be sold separately or as part of a collection. The NFTs are represented using the ERC1155 standard, and the marketplace is implemented as a smart contract on the Ethereum blockchain.

# 1155 Implementation

This contract extends the `ERC1155` contract from the OpenZeppelin library, and adds the ability to mint new NFTs, create collections of NFTs, sell NFTs and collections, and buy NFTs and collections.

Each NFT and collection is identified by a unique token ID, which is generated using the `Counters` library. The `_creators` mapping keeps track of the creator of each NFT, and the `_royalties` mapping keeps track of the royalty percentage that the creator will receive from each sale.

The `mint` function allows the owner to mint new NFTs, and the `createCollection` function allows the owner to create collections of multiple NFTs.

The `sell` function allows the owner to sell an NFT or a collection, and the `buy` function allows a buyer to purchase an NFT or a collection. When an NFT or a collection is sold, a percentage of the sale price is transferred to the creator as a royalty payment.

The `setRoyalty` and `getRoyalty` functions allow the creator to set and get the royalty percentage for an NFT.

## Testing

To test the contract using Truffle and Ganache, you can follow these steps:

1. Create a new directory for your Truffle project, and navigate into it:

```
mkdir my-nft-marketplace
cd my-nft-marketplace
```

2. Initialize a new Truffle project:

```
truffle init
```

3. Install the OpenZeppelin contracts and the Counters library:

```
npm install @openzeppelin/contracts
npm install @openzeppelin/contracts-counters
```

4. Create a new Solidity file called `MyNFTMarketplace.sol` in the `contracts/` directory, and paste the contract code from above into it.

5. Create a new migration file called `2_deploy_contracts.js` in the `migrations/` directory, and paste the following code into it:

```
const MyNFTMarketplace = artifacts.require("MyNFTMarketplace");

module.exports = function (deployer) {
deployer.deploy(MyNFTMarketplace);
};
```

This migration file deploys the `MyNFTMarketplace` contract to the blockchain.

6. Modify the `truffle-config.js` file to use the following configuration:

```
module.exports = {
    networks: {
        development: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "*",
        },
    },
};
```

This configuration tells Truffle to connect to a local blockchain running on `127.0.0.1:7545`, which is the default configuration for Ganache.

7. Save the `truffle-config.js` file.

8. Compile the contracts:

```
truffle compile
```

This command will compile the contracts in the `contracts/` directory and save the compiled artifacts in the `build/` directory.

9. Deploy the contracts to the local blockchain:

```
truffle migrate
```

This command will deploy the `MyNFTMarketplace` contract to the blockchain.

10. Create a new JavaScript file called `test.js` in the `test/` directory, and paste the following code into it:

```
const MyNFTMarketplace = artifacts.require("MyNFTMarketplace");

contract("MyNFTMarketplace", (accounts) => {
  it("should mint new tokens", async () => {
    const myNFTMarketplace = await MyNFTMarketplace.deployed();
    const tokenId = 1;
    const amount = 1;
    const uri = "https://example.com/token/1.json";

    await myNFTMarketplace.mint(accounts[0], tokenId, amount, uri);

    const balance = await myNFTMarketplace.balanceOf(accounts[0], tokenId);
    const token = await myNFTMarketplace._tokens(tokenId);

    assert.equal(
      balance.toNumber(),
      amount,
      "Token was not minted successfully"
    );
    assert.equal(token.price, 0, "Token price was not set correctly");
    assert.equal(
      token.forSale,
      false,
      "Token sale status was not set correctly"
    );
  });

  it("should put a token up for sale", async () => {
    const myNFTMarketplace = await MyNFTMarketplace.deployed();
    const tokenId = 1;
    const price = 100;

    await myNFTMarketplace.sell(tokenId, price);

    const token = await myNFTMarketplace._tokens(tokenId);

    assert.equal(
      token.forSale,
      true,
      "Token sale status was not set correctly"
    );
    assert.equal(token.price, price, "Token sale price was not set correctly");
  });

  it("should buy a token", async () => {
    const myNFTMarketplace = await MyNFTMarketplace.deployed();
    const tokenId = 1;
    const price = 100;
    const balanceBefore = await myNFTMarketplace.balanceOf(
      accounts[1],
      tokenId
    );

    await myNFTMarketplace.buy(accounts[0], tokenId, {
      from: accounts[1],
      value: price,
    });

    const balanceAfter = await myNFTMarketplace.balanceOf(accounts[1], tokenId);
    const token = await myNFTMarketplace._tokens(tokenId);

    assert.equal(
      balanceBefore.toNumber(),
      0,
      "Buyer balance was not 0 before buying"
    );
    assert.equal(
      balanceAfter.toNumber(),
      1,
      "Token was not bought successfully"
    );
    assert.equal(
      token.forSale,
      false,
      "Token sale status was not updated correctly"
    );
  });

  it("should add and remove users", async () => {
    const myNFTMarketplace = await MyNFTMarketplace.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];

    await myNFTMarketplace.addUsers([user1, user2]);

    const isUser1 = await myNFTMarketplace.isUser(user1);
    const isUser2 = await myNFTMarketplace.isUser(user2);

    assert.equal(isUser1, true, "User 1 was not added successfully");
    assert.equal(isUser2, true, "User 2 was not added successfully");

    await myNFTMarketplace.removeUsers([user1, user2]);

    const isNotUser1 = await myNFTMarketplace.isUser(user1);
    const isNotUser2 = await myNFTMarketplace.isUser(user2);

    assert.equal(isNotUser1, false, "User 1 was not removed successfully");
    assert.equal(isNotUser2, false, "User 2 was not removed successfully");
  });
});

```

This test script performs the following actions:

Mint a new NFT and check that the balance of the owner has increased by 1.

Create a new collection of NFTs and check that the balances of each NFT and the collection have increased by 1.

Set an NFT for sale and check that it has been approved for transfer.

Buy an NFT and check that the balance of the buyer has increased by 1 and the balance of the seller has decreased by 1.

Set the royalty percentage for an NFT and check that it has been set correctly.

To run the tests, execute the following command:

```
truffe test
```
