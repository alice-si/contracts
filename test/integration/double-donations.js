var Charity = artifacts.require("Charity");
var SimpleContractRegistry = artifacts.require("SimpleContractRegistry");
var AliceToken = artifacts.require("AliceToken");
var ImpactRegistry = artifacts.require("ImpactRegistry");
var Linker = artifacts.require("SmartImpactLinker");

const BigNumber = web3.BigNumber;

const should = require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bignumber')(BigNumber))
	.should();

contract('Double donations', function(accounts) {
  var main = accounts[0];
  var donor1 = accounts[1];
  var donor2 = accounts[2];
  var judge = accounts[3];
  var beneficiary = accounts[4];
  var charity, token, contractProvider, impactRegistryRegistry;

  it("should link charity to judge", function(done) {
    Charity.deployed().then(function(instance) {
      charity = instance;
      return charity.setJudge(judge, {from: main})
    }).then(function() {
      return charity.judgeAddress.call();
    }).then(function(address) {
      return assert.equal(address, judge, "Judge address wasn't set correctly");
    })
      .then(done)
      .catch(done);
  });

  it("should link charity to beneficiary", function(done) {
    charity.setBeneficiary(beneficiary, {from: main}).then(function() {
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

  it("should notify from donor1", function (done) {
    charity.notify(donor1, 10, {from: main}).then(function () {
      return charity.total()
    }).then(function (total) {
      return assert.equal(total.valueOf(), 10, "10 wasn't in token charity balance after the first donation");
    }).then(function() {
      return charity.getBalance.call(donor1)
    }).then(function(balance) {
      return assert.equal(balance.valueOf(), 10, "10 wasn't in internal balance");
    })
      .then(done)
      .catch(done);
  });


  it("should directly deposit to charity from second donor", function (done) {
    charity.notify(donor2, 20, {from: main}).then(function () {
      return charity.total()
    }).then(function (total) {
      return assert.equal(total.valueOf(), 30, "30 wasn't in token charity balance after the first donation");
    }).then(function() {
      return charity.getBalance.call(donor2, {from: main})
    }).then(function(balance) {
      return assert.equal(balance.valueOf(), 20, "20 wasn't in internal balance");
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
    //First donation
    token.mint(charity.address, 30, {from: main}).then(function () {
      return token.balanceOf.call(charity.address, {from: main})
    }).then(function (balance) {
      return assert.equal(balance.valueOf(), 30, "30 wasn't minted");
    })
      .then(done)
      .catch(done);
  });

  it("should unlock outcome", function (done) {
    token.balanceOf.call(charity.address).then(function (balance) {
      assert.equal(balance.valueOf(), 30, "30 wasn't in charity before unlocking outcome");
    }).then(function () {
      return token.balanceOf.call(beneficiary);
    }).then(function (balance) {
      return assert.equal(balance.valueOf(), 0, "0 wasn't in beneficiary before unlocking outcome");
    }).then(function () {
      return charity.unlockOutcome("Outcome", 25, {from: judge});
    }).then(function () {
      return token.balanceOf.call(charity.address);
    }).then(function (balance) {
      return assert.equal(balance.valueOf(), 5, "0 wasn't in charity after unlocking outcome");
    }).then(function() {
      return token.balanceOf.call(beneficiary);
    }).then(function (balance) {
      return assert.equal(balance.valueOf(), 25, "30 wasn't in beneficiary after unlocking outcome");
    })
      .then(done)
      .catch(done);
  });

	it("should configure linker", async function () {
		linker = await Linker.new(impactRegistry.address, 10);
		await impactRegistry.setLinker(linker.address);

		(await linker.unit()).should.be.bignumber.equal(10);
		(await linker.registry()).should.be.equal(impactRegistry.address);
	});

  it("should link impactRegistry", function (done) {
    impactRegistry.linkImpact("Outcome", {from: main}).then(function () {
      return impactRegistry.getImpactLinked.call("Outcome", {from: main})
    }).then(function(result) {
      assert.equal(result.valueOf(), 10, "10 wasn't linked after first link call");
      return impactRegistry.getImpactCount.call("Outcome", {from: main})
    }).then(function(result) {
      assert.equal(result.valueOf(), 1, "1 wasn't number of impactRegistry after first link call");
      return impactRegistry.getImpactDonor.call("Outcome", 0, {from: main})
    }).then(function(result) {
      assert.equal(result, donor1, "donor1 wasn't address after first link call");
      return impactRegistry.getImpactValue.call("Outcome", donor1, {from: main})
    }).then(function(result) {
      assert.equal(result.valueOf(), 10, "10 wasn't impactRegistry value after first link call");

      return impactRegistry.linkImpact("Outcome", {from: main})
    }).then(function () {
      return impactRegistry.getImpactLinked.call("Outcome", {from: main})
    }).then(function(result) {
      assert.equal(result.valueOf(), 20, "20 wasn't linked after second link call");
      return impactRegistry.getImpactCount.call("Outcome", {from: main})
    }).then(function(result) {
      assert.equal(result.valueOf(), 2, "2 wasn't number of impactRegistry after first link call");
      return impactRegistry.getImpactDonor.call("Outcome", 1, {from: main})
    }).then(function(result) {
      assert.equal(result, donor2, "donor2 wasn't address after first link call");
      return impactRegistry.getImpactValue.call("Outcome", donor2, {from: main})
    }).then(function(result) {
      assert.equal(result.valueOf(), 10, "10 wasn't impactRegistry value after first link call");

      return impactRegistry.linkImpact("Outcome", {from: main})
    }).then(function () {
      return impactRegistry.getImpactLinked.call("Outcome", {from: main})
    }).then(function(result) {
      assert.equal(result.valueOf(), 25, "30 wasn't linked after second link call");
      return impactRegistry.getImpactCount.call("Outcome", {from: main})
    }).then(function(result) {
      assert.equal(result.valueOf(), 2, "2 wasn't number of impactRegistry after first link call");
      return impactRegistry.getImpactDonor.call("Outcome", 1, {from: main})
    }).then(function(result) {
      assert.equal(result, donor2, "donor2 wasn't address after first link call");
      return impactRegistry.getImpactValue.call("Outcome", donor2, {from: main})
    }).then(function (result) {
      assert.equal(result.valueOf(), 15, "15 wasn't impactRegistry value after first link call");
    })
      .then(done)
      .catch(done);
  });

  it("should pay back outstanding balance", function (done) {
    token.balanceOf.call(charity.address).then(function (balance) {
      assert.equal(balance.valueOf(), 5, "5 wasn't in charity before payback");
    }).then(function () {
      return token.balanceOf.call(donor2);
    }).then(function (balance) {
      return assert.equal(balance.valueOf(), 0, "0 wasn't in donor before payback");
    }).then(function () {
      return charity.payBack(donor2);
    }).then(function () {
      return token.balanceOf.call(charity.address);
    }).then(function (balance) {
      return assert.equal(balance.valueOf(), 0, "0 wasn't in charity after payback");
    }).then(function() {
      return token.balanceOf.call(donor2);
    }).then(function (balance) {
      assert.equal(balance.valueOf(), 5, "5 wasn't in donor after payback");
    })
      .then(done)
      .catch(done);
  });

});
