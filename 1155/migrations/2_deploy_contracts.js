const MyNFTMarketplace = artifacts.require("MyNFTMarketplace");

module.exports = function (deployer) {
  deployer.deploy(MyNFTMarketplace);
};
