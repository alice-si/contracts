var Project = artifacts.require("Project");
var ProjectCatalog = artifacts.require("ProjectCatalog");
var Coupon = artifacts.require("Coupon");
var InvestmentWallet = artifacts.require("InvestmentWallet");
var DonationWallet = artifacts.require("DonationWallet");
var AliceToken = artifacts.require("AliceToken");
var ImpactRegistry = artifacts.require("ImpactRegistry");
var ClaimsRegistry = artifacts.require("ClaimsRegistry");
var Linker = artifacts.require("FlexibleImpactLinker");

require("../test-setup");

contract('Project - single donation', function([owner, beneficiary, validator, donor]) {
  var project;
  var catalog;
  var wallet;
  var token;
  var impactRegistry;
  var linker;
  var claimsRegistry;


  it("should deploy Project with Bonds contract", async function() {
    project = await Project.new("TEST", 0);
    impactRegistry = await ImpactRegistry.new(project.address);
    claimsRegistry = await ClaimsRegistry.new();
    linker = await Linker.new(impactRegistry.address, 10);
    token = await AliceToken.deployed();

    await impactRegistry.setLinker(linker.address);
    await project.setImpactRegistry(impactRegistry.address);
    await project.setBeneficiary(beneficiary);
    await project.setValidator(validator);
    await project.setClaimsRegistry(claimsRegistry.address);
    await project.setToken(token.address);

    catalog = await ProjectCatalog.new();
    await catalog.addProject("TEST", project.address);
  });

  it("should donate", async function() {
    wallet = await DonationWallet.new(catalog.address);
    await token.mint(wallet.address, 1000);
    await wallet.donate(1000, "TEST");
  });

  it("should register and validate claim", async function() {
    var val = '0x' + web3.padLeft(web3.toHex(100).substr(2), 64);
    await claimsRegistry.setClaim(project.address, "OUTCOME", val, {from: beneficiary});
    await claimsRegistry.approveClaim(beneficiary, project.address, "OUTCOME", {from: validator});
  });

  it("should unlock outcome", async function() {
    await project.validateOutcome("OUTCOME", 100, {from: validator});
    await impactRegistry.linkImpact("OUTCOME");
  });

  it("should link impact", async function() {
    (await project.getBalance(wallet.address)).should.be.bignumber.equal(990);
    for (var i = 0; i < 5; i++) {
      await impactRegistry.linkImpact("OUTCOME");
    }
    (await project.getBalance(wallet.address)).should.be.bignumber.equal(940);
  });

  it("should link limited number of impacts", async function() {
    for (var i = 0; i < 10; i++) {
      await impactRegistry.linkImpact("OUTCOME");
    }
    (await project.getBalance(wallet.address)).should.be.bignumber.equal(900);
  });

  it("should pay back to donor", async function() {
    (await token.balanceOf(project.address)).should.be.bignumber.equal(900);
    (await project.getBalance(wallet.address)).should.be.bignumber.equal(900);
    (await token.balanceOf(wallet.address)).should.be.bignumber.equal(0);

    await project.payBack(wallet.address);

    (await token.balanceOf(project.address)).should.be.bignumber.equal(0);
    (await token.balanceOf(wallet.address)).should.be.bignumber.equal(900);


  });

});
