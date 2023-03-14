const MyNFTMarketplace = artifacts.require("MyNFTMarketplace");

contract("MyNFTMarketplace", (accounts) => {
  // const creator = "0xaC331836ae921C5A949d74E22763c8040b0aEa5C"; //manually set
  const buyer = accounts[1];
  const seller = accounts[2];
  const creator = accounts[2];
  const tokenId = 1;
  const tokenPrice = 100;

  it("should mint new tokens", async () => {
    const myNFTMarketplace = await MyNFTMarketplace.deployed();
    const tokenId = 1;
    const amount = 1;
    const uri = "https://example.com/token/1.json";

    await myNFTMarketplace.mint(accounts[0], tokenId, amount, uri, creator);

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
  it("should buy an NFT and pay creator loyalty fee", async () => {
    const myNFTMarketplace = await MyNFTMarketplace.new();

    // Mint a new NFT with creator set to `creator`
    await myNFTMarketplace.mint(
      seller,
      tokenId,
      1,
      "https://ipfs.io/ipfs/QmZ9JYXNvgksvyJxMfF1pvdifgJyG4pKm4Z8RdMWJ52XsT",
      creator
    );

    // Set the token for sale with a price
    await myNFTMarketplace.sell(tokenId, tokenPrice);

    // Buy the token
    const balanceBefore = await myNFTMarketplace.balanceOf(seller, tokenId);
    await myNFTMarketplace.buy(tokenId, { from: buyer, value: tokenPrice });
    const balanceAfter = await myNFTMarketplace.balanceOf(seller, tokenId);

    // Check that the token has been transferred to the buyer
    assert.equal(balanceBefore.toNumber(), 1);
    assert.equal(balanceAfter.toNumber(), 0);

    // Check that the seller has been paid the token price minus the loyalty fee
    const sellerBalance = await web3.eth.getBalance(seller);
    const expectedSellerBalance = web3.utils
      .toBN(tokenPrice)
      .sub(
        web3.utils
          .toBN(tokenPrice)
          .mul(web3.utils.toBN(2))
          .div(web3.utils.toBN(100))
      );
    assert.equal(sellerBalance.toString(), expectedSellerBalance.toString());

    // Check that the creator has been paid the loyalty fee
    const creatorBalance = await web3.eth.getBalance(creator);
    const expectedCreatorBalance = web3.utils
      .toBN(tokenPrice)
      .mul(web3.utils.toBN(2))
      .div(web3.utils.toBN(100));
    assert.equal(creatorBalance.toString(), expectedCreatorBalance.toString());
  });

  // it("should buy a token", async () => {
  //   const myNFTMarketplace = await MyNFTMarketplace.deployed();
  //   const tokenId = 1;
  //   const price = 100;
  //   const balanceBefore = await myNFTMarketplace.balanceOf(
  //     accounts[1],
  //     tokenId
  //   );

  //   await myNFTMarketplace.buy(accounts[0], tokenId, {
  //     from: accounts[1],
  //     value: price,
  //   });

  //   const balanceAfter = await myNFTMarketplace.balanceOf(accounts[1], tokenId);
  //   const token = await myNFTMarketplace._tokens(tokenId);

  //   assert.equal(
  //     balanceBefore.toNumber(),
  //     0,
  //     "Buyer balance was not 0 before buying"
  //   );
  //   assert.equal(
  //     balanceAfter.toNumber(),
  //     1,
  //     "Token was not bought successfully"
  //   );
  //   assert.equal(
  //     token.forSale,
  //     false,
  //     "Token sale status was not updated correctly"
  //   );
  // });

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
