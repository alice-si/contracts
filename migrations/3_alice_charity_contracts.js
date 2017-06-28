var Charity = artifacts.require("Charity");
var ImpactRegistry = artifacts.require("ImpactRegistry");
var SimpleContractRegistry = artifacts.require("SimpleContractRegistry");

module.exports = function(deployer, network, accounts) {
  var judgeAccount = accounts[1];
  var beneficiaryAccount = accounts[2];
  var unit = 10;

  deployer.deploy(Charity, "London Homeless"
  ).then(function() {
    console.log("Charity deployed to: " + Charity.address);
    return deployer.deploy(ImpactRegistry, Charity.address, 1000);
  }).then(function() {
    console.log("Unit set to : " + unit);
    return ImpactRegistry.deployed().then(function(instance) {
      return instance.setUnit(unit);
    });
  }).then(function() {
    console.log("Impact deployed to: " + ImpactRegistry.address);
    return Charity.deployed().then(function(instance) {
      return instance.setImpactRegistry(ImpactRegistry.address);
    });
  }).then(function() {
    console.log("Charity linked to impact: " + ImpactRegistry.address);
    return Charity.deployed().then(function(instance) {
      return instance.setJudge(judgeAccount);
    });
  }).then(function() {
    console.log("Charity linked to judge");
    return Charity.deployed().then(function(instance) {
      return instance.setBeneficiary(beneficiaryAccount);
    });
  }).then(function() {
    console.log("Charity linked to beneficiary");
    return Charity.deployed().then(function(instance) {
      return instance.setContractProvider(SimpleContractRegistry.address);
    });
  }).then(function() {
    console.log("Charity linked to Contract Provider");
  });
};