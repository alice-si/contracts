var Project = artifacts.require("project");
var SimpleContractRegistry = artifacts.require("SimpleContractRegistry");
var AliceToken = artifacts.require("AliceToken");
var ImpactRegistry = artifacts.require("ImpactRegistry");
var Linker = artifacts.require("FlexibleImpactLinker");

const BigNumber = web3.BigNumber

const should = require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bignumber')(BigNumber))
	.should()

contract('Single donation', function(accounts) {
  var main = accounts[0];
  var donor = accounts[1];
  var val = accounts[3];
  var beneficiary = accounts[4];
  var project, token, contractProvider, impactRegistry;

  it("should link project to validator", function(done) {
    Project.deployed().then(function(instance) {
      project = instance;
      return project.setValidator(validator, {from: main})
    }).then(function() {
      return project.validatorAddress.call();
    }).then(function(address) {
      return assert.equal(address, validator, "Validator address wasn't set correctly");
    })
      .then(done)
      .catch(done);
  });

  it("should link project to beneficiary", function(done) {
    project.setBeneficiary(beneficiary, {from: main}).then(function() {
      return project.beneficiaryAddress.call();
    }).then(function(address) {
      return assert.equal(address, beneficiary, "Beneficiary address wasn't set correctly");
    })
      .then(done)
      .catch(done);
  });

  it("should link project to contract provider", function(done) {
    SimpleContractRegistry.deployed().then(function(instance) {
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

  it("should link project to impact registry", function(done) {
    ImpactRegistry.deployed().then(function(instance) {
      impactRegistry = instance;
      return project.setImpactRegistry(impactRegistry.address, {from: main})
    }).then(function() {
      return project.IMPACT_REGISTRY_ADDRESS.call();
    }).then(function(address) {
      return assert.equal(address, impactRegistry.address, "Impact registry address wasn't set correctly");
    })
      .then(done)
      .catch(done);
  });

  it("should update balance after notification", function (done) {
    project.notify(donor, 10, {from: main}).then(function () {
      return project.total()
    }).then(function (total) {
      return assert.equal(total.valueOf(), 10, "10 wasn't in token project balance after the donation");
    }).then(function() {
      return project.getBalance.call(donor)
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
    token.mint(project.address, 10, {from: main, gas: 300000}).then(function () {
      return token.balanceOf.call(project.address, {from: main})
    }).then(function (balance) {
      return assert.equal(balance.valueOf(), 10, "10 wasn't minted");
    })
      .then(done)
      .catch(done);
  });

  it("should unlock outcome", function (done) {
    token.balanceOf.call(project.address).then(function (balance) {
      return assert.equal(balance.valueOf(), 10, "10 wasn't in project before unlocking outcome");
    }).then(function () {
      return token.balanceOf.call(beneficiary);
    }).then(function (balance) {
      return assert.equal(balance.valueOf(), 0, "0 wasn't in beneficiary before unlocking outcome");
    }).then(function () {
      return project.unlockOutcome("Outcome", 10, {from: validator});
    }).then(function() {
      return token.balanceOf.call(project.address);
    }).then(function (balance) {
      return assert.equal(balance.valueOf(), 0, "0 wasn't in project after unlocking outcome");
    }).then(function () {
      return token.balanceOf.call(beneficiary);
    }).then(function (balance) {
      return assert.equal(balance.valueOf(), 10, "10 wasn't in beneficiary after unlocking outcome");
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
