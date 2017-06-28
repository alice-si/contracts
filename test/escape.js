var Charity = artifacts.require("Charity");
var SimpleContractRegistry = artifacts.require("SimpleContractRegistry");
var AliceToken = artifacts.require("AliceToken");

contract('Escape', function(accounts) {
  var charity, contractProvider, token;
  var main = accounts[0];
  var donor = accounts[1];
  var escapeAddress = accounts[2];

  it("should link charity to contract provider", function(done) {
    Charity.deployed().then(function(instance) {
      charity = instance;
      return SimpleContractRegistry.deployed()
    }).then(function(instance) {
      contractProvider = instance;
      return charity.setContractProvider(contractProvider.address, {from: main})
    }).then(function() {
      return charity.CONTRACT_PROVIDER_ADDRESS.call();
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

  it("should mint tokens to charity account", function (done) {
    token.mint(charity.address, 30, {from: main, gas: 300000}).then(function () {
      return token.balanceOf.call(charity.address, {from: main})
    }).then(function (balance) {
      return assert.equal(balance.valueOf(), 30, "30 wasn't minted");
    }).then(function() {
      return charity.notify(donor, 30, {from: main, gas: 3000000})
    }).then(function() {
      return charity.total.call()
    }).then(function(total) {
      return assert.equal(total.valueOf(), 30, "30 wasn't minted");
    })
      .then(done)
      .catch(done);
  });

  it("should allow escape to secure address", function (done) {
    charity.escape(escapeAddress, {from: main})
    .then(function () {
      return token.balanceOf.call(charity.address, {from: main})
    }).then(function (balance) {
      return assert.equal(balance.valueOf(), 0, "charity balance should be empty after escape");
    })
      .then(done)
      .catch(done);
  });

});
