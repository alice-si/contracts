Project = artifacts.require("project");
var SimpleContractRegistry = artifacts.require("SimpleContractRegistry");
var AliceToken = artifacts.require("AliceToken");

contract('Escape', function(accounts) {
  var project, contractProvider, token;
  var main = accounts[0];
  var donor = accounts[1];
  var escapeAddress = accounts[2];

  it("should link project to contract provider", function(done) {
    Project.deployed().then(function(instance) {
      project = instance;
      return SimpleContractRegistry.deployed()
    }).then(function(instance) {
      contractProvider = instance;
      return project.setContractProvider(contractProvider.address, {from: main})
    }).then(function() {
      return project.CONTRACT_PROVIDER_ADDRESS.call();
    }).then(function(address) {
      return assert.equal(address, contractProvider.address, "Contract provider address wasn't set correctly");
    })
      .then(done)
      .catch(done);
  });

  it("should get token contract from registry", function(done) {
    SimpleContractRegistry.deployed().then(function(registryInstance) {
      return registryInstance.contracts.call('digitalGBP');
    }).then(function(address) {
      token = AliceToken.at(address);
      return assert.notEqual(token, undefined);
    })
      .then(done)
      .catch(done);
  });

  it("should mint tokens to project account", function (done) {
    token.mint(project.address, 30, {from: main, gas: 300000}).then(function () {
      return token.balanceOf.call(project.address, {from: main})
    }).then(function (balance) {
      return assert.equal(balance.valueOf(), 30, "30 wasn't minted");
    }).then(function() {
      return project.notify(donor, 30, {from: main, gas: 3000000})
    }).then(function() {
      return project.total.call()
    }).then(function(total) {
      return assert.equal(total.valueOf(), 30, "30 wasn't minted");
    })
      .then(done)
      .catch(done);
  });

  it("should allow escape to secure address", function (done) {
    project.escape(escapeAddress, {from: main})
    .then(function () {
      return token.balanceOf.call(project.address, {from: main})
    }).then(function (balance) {
      return assert.equal(balance.valueOf(), 0, "project balance should be empty after escape");
    })
      .then(done)
      .catch(done);
  });

});
