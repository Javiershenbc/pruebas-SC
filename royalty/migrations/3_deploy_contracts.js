const RoyaltyNFT = artifacts.require("RoyaltyNFT");
const NFTMarketplace = artifacts.require("NFTMarketplace");

module.exports = async function (deployer) {
  const royaltyNFT = await RoyaltyNFT.deployed();
  await deployer.deploy(RoyaltyNFT);
  const nftMarketplace = await NFTMarketplace.deployed();

  await deployer.deploy(NFTMarketplace, royaltyNFT.address);
};
