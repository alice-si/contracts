var Project = artifacts.require("Project");
var ImpactRegistry = artifacts.require("ImpactRegistry");
var SimpleContractRegistry = artifacts.require("SimpleContractRegistry");

module.exports = function(deployer, network, accounts) {
  var judgeAccount = accounts[1];
  var beneficiaryAccount = accounts[2];
  var unit = 10;

  deployer.deploy(Project, "London Homeless"
  ).then(function() {
    console.log("Project deployed to: " + Project.address);
    return deployer.deploy(ImpactRegistry, Project.address, 1000);
  }).then(function() {
    console.log("Unit set to : " + unit);
    return ImpactRegistry.deployed().then(function(instance) {
      return instance.setUnit(unit);
    });
  }).then(function() {
    console.log("Impact deployed to: " + ImpactRegistry.address);
    return Project.deployed().then(function(instance) {
      return instance.setImpactRegistry(ImpactRegistry.address);
    });
  }).then(function() {
    console.log("Project linked to impact: " + ImpactRegistry.address);
    return Project.deployed().then(function(instance) {
      return instance.setJudge(judgeAccount);
    });
  }).then(function() {
    console.log("Project linked to judge");
    return Project.deployed().then(function(instance) {
      return instance.setBeneficiary(beneficiaryAccount);
    });
  }).then(function() {
    console.log("Project linked to beneficiary");
    return Project.deployed().then(function(instance) {
      return instance.setContractProvider(SimpleContractRegistry.address);
    });
  }).then(function() {
    console.log("Project linked to Contract Provider");
  });
};