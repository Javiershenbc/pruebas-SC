const royaltyNFT = artifacts.require("royaltyNFT");
const nftMarketplace = artifacts.require("NFTMarketplace");

contract("royaltyNFT", function (accounts) {
  it("should support the ERC721 and ERC2198 standards", async () => {
    const royaltyNFTInstance = await royaltyNFT.deployed();
    const ERC721InterfaceId = "0x80ac58cd";
    const ERC2981InterfaceId = "0x2a55205a";
    var isERC721 = await royaltyNFTInstance.supportsInterface(
      ERC721InterfaceId
    );
    var isER2981 = await royaltyNFTInstance.supportsInterface(
      ERC2981InterfaceId
    );
    assert.equal(isERC721, true, "royaltyNFT is not an ERC721");
    assert.equal(isER2981, true, "royaltyNFT is not an ERC2981");
  });
  it("should return the correct royalty info when specified and burned", async () => {
    const royaltyNFTInstance = await royaltyNFT.deployed();
    await royaltyNFTInstance.mintNFT(accounts[0], "fakeURI");
    // Override royalty for this token to be 10% and paid to a different account.
    // Account 0 is the owner, account 1 is the creator
    await royaltyNFTInstance.mintNFTWithRoyalty(
      accounts[0],
      "fakeURI",
      accounts[1],
      1000
    );

    const defaultRoyaltyInfo = await royaltyNFTInstance.royaltyInfo.call(
      1,
      1000
    );
    var tokenRoyaltyInfo = await royaltyNFTInstance.royaltyInfo.call(2, 1000);
    const owner = await royaltyNFTInstance.owner.call();
    assert.equal(
      defaultRoyaltyInfo[0],
      owner,
      "Default receiver is not the owner"
    );
    // Default royalty percentage taken should be 1%.
    assert.equal(defaultRoyaltyInfo[1].toNumber(), 10, "Royalty fee is not 10");
    assert.equal(
      tokenRoyaltyInfo[0],
      accounts[1],
      "Royalty receiver is not a different account"
    );
    // Default royalty percentage taken should be 10%.
    assert.equal(tokenRoyaltyInfo[1].toNumber(), 100, "Royalty fee is not 100");

    // Royalty info should be set back to default when NFT is burned
    await royaltyNFTInstance.burnNFT(2);
    tokenRoyaltyInfo = await royaltyNFTInstance.royaltyInfo.call(2, 1000);
    assert.equal(
      tokenRoyaltyInfo[0],
      owner,
      "Royalty receiver has not been set back to default"
    );
    assert.equal(
      tokenRoyaltyInfo[1].toNumber(),
      10,
      "Royalty has not been set back to default"
    );
  });
});

contract("NFTMarketplace", (accounts) => {
  //   let nftMarketplace;
  let royaltyNFTInstance;
  let nftMarketplaceInstance;
  beforeEach(async () => {
    royaltyNFTInstance = await royaltyNFT.deployed();
    nftMarketplaceInstance = await nftMarketplace.deployed();
    nftMarketplaceContract = await nftMarketplace.new(
      royaltyNFTInstance.address
    );

    // Mint some NFTs
    for (let i = 0; i < 3; i++) {
      await royaltyNFTInstance.mintNFTWithRoyalty(
        accounts[0],
        "fakeURI",
        accounts[1],
        1000
      );
    }
    for (let i = 1; i <= 3; i++) {
      await royaltyNFTInstance.setApprovalForAll(
        nftMarketplaceContract.address,
        true,
        { from: accounts[0] }
      );
    }
  });

  it("should list NFT and buy NFTs", async () => {
    const tokenId = 3;
    const price = 1;

    // List an NFT for sale
    await nftMarketplaceContract.listNFT(tokenId, price, { from: accounts[0] });

    // Check that the NFT is listed
    const listedPrice = await nftMarketplaceContract.tokenPrice(tokenId);
    assert.equal(listedPrice, price);

    // Buy the NFT
    await nftMarketplaceContract.buyNFT(tokenId, {
      from: accounts[4],
      value: price,
    });

    // Retrieve the token URI for the given tokenId
    const tokenURI = await royaltyNFTInstance.tokenURI(tokenId);
    const isListed = tokenURI.exists;
    assert.equal(isListed, undefined);
    // Check that the NFT is no longer listed and that ownership has been transferred
    const owner = await royaltyNFTInstance.ownerOf(tokenId);
    assert.equal(owner, accounts[4]);
    for (let i = 1; i <= 3; i++) {
      await royaltyNFTInstance.setApprovalForAll(
        nftMarketplaceContract.address,
        false
      );
    }
  });
});

// const RoyaltyNFT = artifacts.require("RoyaltyNFT");

// const royaltyNFT = artifacts.require("royaltyNFT");

// contract("royaltyNFT", function (accounts) {
//   it("should support the ERC721 and ERC2198 standards", async () => {
//     const royalPetsInstance = await royaltyNFT.deployed();
//     const ERC721InterfaceId = "0x80ac58cd";
//     const ERC2981InterfaceId = "0x2a55205a";
//     var isERC721 = await royalPetsInstance.supportsInterface(ERC721InterfaceId);
//     var isER2981 = await royalPetsInstance.supportsInterface(
//       ERC2981InterfaceId
//     );
//     assert.equal(isERC721, true, "royaltyNFT is not an ERC721");
//     assert.equal(isER2981, true, "royaltyNFT is not an ERC2981");
//   });
//   it("should return the correct royalty info when specified and burned", async () => {
//     const royalPetsInstance = await royaltyNFT.deployed();
//     await royalPetsInstance.mintNFT(accounts[0], "fakeURI");
//     // Override royalty for this token to be 10% and paid to a different account
//     await royalPetsInstance.mintNFTWithRoyalty(
//       accounts[0],
//       "fakeURI",
//       accounts[1],
//       1000
//     );

//     const defaultRoyaltyInfo = await royalPetsInstance.royaltyInfo.call(
//       1,
//       1000
//     );
//     var tokenRoyaltyInfo = await royalPetsInstance.royaltyInfo.call(2, 1000);
//     const owner = await royalPetsInstance.owner.call();
//     assert.equal(
//       defaultRoyaltyInfo[0],
//       owner,
//       "Default receiver is not the owner"
//     );
//     // Default royalty percentage taken should be 1%.
//     assert.equal(defaultRoyaltyInfo[1].toNumber(), 10, "Royalty fee is not 10");
//     assert.equal(
//       tokenRoyaltyInfo[0],
//       accounts[1],
//       "Royalty receiver is not a different account"
//     );
//     // Default royalty percentage taken should be 10%.
//     assert.equal(tokenRoyaltyInfo[1].toNumber(), 100, "Royalty fee is not 100");

//     // Royalty info should be set back to default when NFT is burned
//     await royalPetsInstance.burnNFT(2);
//     tokenRoyaltyInfo = await royalPetsInstance.royaltyInfo.call(2, 1000);
//     assert.equal(
//       tokenRoyaltyInfo[0],
//       owner,
//       "Royalty receiver has not been set back to default"
//     );
//     assert.equal(
//       tokenRoyaltyInfo[1].toNumber(),
//       10,
//       "Royalty has not been set back to default"
//     );
//   });
// });
