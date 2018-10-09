var DigitalGBP = artifacts.require("../contracts/alice/DigitalGBPToken.sol");

module.exports = function(deployer) {
  deployer.deploy(DigitalGBP);
};
