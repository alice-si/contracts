var Charity = artifacts.require("Charity");
var SimpleContractRegistry = artifacts.require("SimpleContractRegistry");
var AliceToken = artifacts.require("AliceToken");
var ImpactRegistry = artifacts.require("ImpactRegistry");

contract('Single donation', function(accounts) {
  var main = accounts[0];
  var donor = accounts[1];
  var judge = accounts[3];
  var beneficiary = accounts[4];
  var charity, token, contractProvider, impactRegistry;

  it("should link charity to judge", function(done) {
    Charity.deployed().then(function(instance) {
      charity = instance;
      return charity.setJudge(judge, 10, {from: main})
    }).then(function() {
      return charity.judgeAddress.call();
    }).then(function(address) {
      return assert.equal(address, judge, "Judge address wasn't set correctly");
    })
      .then(done)
      .catch(done);
  });

  it("should link charity to beneficiary", function(done) {
    charity.setBeneficiary(beneficiary, 10, {from: main}).then(function() {
      return charity.beneficiaryAddress.call();
    }).then(function(address) {
      return assert.equal(address, beneficiary, "Beneficiary address wasn't set correctly");
    })
      .then(done)
      .catch(done);
  });

  it("should link charity to contract provider", function(done) {
    SimpleContractRegistry.deployed().then(function(instance) {
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

  it("should link charity to impact registry", function(done) {
    ImpactRegistry.deployed().then(function(instance) {
      impactRegistry = instance;
      return charity.setImpactRegistry(impactRegistry.address, {from: main})
    }).then(function() {
      return charity.IMPACT_REGISTRY_ADDRESS.call();
    }).then(function(address) {
      return assert.equal(address, impactRegistry.address, "Impact registry address wasn't set correctly");
    })
      .then(done)
      .catch(done);
  });

  it("should update balance after notification", function (done) {
    charity.notify(donor, 10, {from: main}).then(function () {
      return charity.total()
    }).then(function (total) {
      return assert.equal(total.valueOf(), 10, "10 wasn't in token charity balance after the donation");
    }).then(function() {
      return charity.getBalance.call(donor)
    }).then(function(balance) {
      return assert.equal(balance.valueOf(), 10, "10 wasn't in donor balance");
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

  it("should mint tokens", function (done) {
    token.mint(charity.address, 10, {from: main, gas: 300000}).then(function () {
      return token.balanceOf.call(charity.address, {from: main})
    }).then(function (balance) {
      return assert.equal(balance.valueOf(), 10, "10 wasn't minted");
    })
      .then(done)
      .catch(done);
  });

  it("should unlock outcome", function (done) {
    token.balanceOf.call(charity.address).then(function (balance) {
      return assert.equal(balance.valueOf(), 10, "10 wasn't in charity before unlocking outcome");
    }).then(function () {
      return token.balanceOf.call(beneficiary);
    }).then(function (balance) {
      return assert.equal(balance.valueOf(), 0, "0 wasn't in beneficiary before unlocking outcome");
    }).then(function () {
      return charity.unlockOutcome("Outcome", 10, {from: judge});
    }).then(function() {
      return token.balanceOf.call(charity.address);
    }).then(function (balance) {
      return assert.equal(balance.valueOf(), 0, "0 wasn't in charity after unlocking outcome");
    }).then(function () {
      return token.balanceOf.call(beneficiary);
    }).then(function (balance) {
      return assert.equal(balance.valueOf(), 10, "10 wasn't in beneficiary after unlocking outcome");
    })
      .then(done)
      .catch(done);
  });

  it("should link impact", function (done) {
    impactRegistry.linkImpact("Outcome", {from: main}).then(function () {
      return impactRegistry.getImpactLinked.call("Outcome", {from: main})
    }).then(function(result) {
      assert.equal(result.valueOf(), 10, "10 wasn't linked after first link call");
      return impactRegistry.getImpactCount.call("Outcome", {from: main})
    }).then(function(result) {
      assert.equal(result.valueOf(), 1, "1 wasn't number of impact after first link call");
      return impactRegistry.getImpactDonor.call("Outcome", 0, {from: main})
    }).then(function(result) {
      assert.equal(result, donor, "donor address wasn't address after first link call");
      return impactRegistry.getImpactValue.call("Outcome", donor, {from: main})
    }).then(function(result) {
      assert.equal(result.valueOf(), 10, "10 wasn't impact value after first link call");
    })
      .then(done)
      .catch(done);
  });

});
