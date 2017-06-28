var SimpleContractRegistry = artifacts.require("SimpleContractRegistry");
var AliceToken = artifacts.require("AliceToken");

module.exports = function(deployer) {
  deployer.deploy(SimpleContractRegistry
  ).then(function() {
    console.log("Simple contract registry deployed to: " + SimpleContractRegistry.address);
    return deployer.deploy(AliceToken);
  }).then(function() {
    console.log("Alice Token deployed to: " + AliceToken.address);
    return SimpleContractRegistry.deployed().then(function(instance) {
      return instance.registerContract("digitalGBP", AliceToken.address);
    });
  }).then(function() {
    console.log("Alice token registered: " + AliceToken.address);
  })
};
