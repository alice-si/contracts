var Project = artifacts.require("Project");
var ProjectWithBonds = artifacts.require("ProjectWithBonds");
var ProjectCatalog = artifacts.require("ProjectCatalog");
var Coupon = artifacts.require("Coupon");
var InvestmentWallet = artifacts.require("InvestmentWallet");
var DonationWallet = artifacts.require("DonationWallet");
var Gbp = artifacts.require("DigitalGBPToken");
var ImpactRegistry = artifacts.require("ImpactRegistry");
var Linker = artifacts.require("FlexibleImpactLinker");

require("../test-setup");

contract('Project - single donation', function([owner, beneficiary, validator, donor]) {
  var project;
  var catalog;
  var wallet;
  var gbp;
  var registry;
  var registryForProjectWithBonds;
  var linker;

  it("should deploy Project with Bonds contract", async function() {
    project = await Project.new("TEST", 40);
    registry = await ImpactRegistry.new(project.address);
    registryForProjectWithBonds = await ImpactRegistry.new(project.address);
    linker = await Linker.new(registry.address, 10);
    gbp = await Gbp.new();

    await registry.setLinker(linker.address);
    await project.setImpactRegistry(registry.address);
    await project.setBeneficiary(beneficiary);
    await project.setValidator(validator);
    await project.setToken(gbp.address);

    catalog = await ProjectCatalog.new();
    await catalog.addProject("TEST", project.address);
  });

  it("should donate", async function() {
    wallet = await DonationWallet.new(catalog.address);
    await gbp.mint(wallet.address, 100);
    await wallet.donate(100, "TEST");
  });

  it("should keep sent upfront payment to beneficiary", async function() {
    (await gbp.balanceOf(project.address)).should.be.bignumber.equal(60);
    (await gbp.balanceOf(beneficiary)).should.be.bignumber.equal(40);
  });



  it("should validate", async function() {
    await project.validateOutcome("OUTCOME", 50, {from: validator});
    (await gbp.balanceOf(project.address)).should.be.bignumber.equal(10);
    (await gbp.balanceOf(beneficiary)).should.be.bignumber.equal(90);
  });


  it("should link impact", async function() {
    for (var i = 0; i < 5; i++) {
      await registry.linkImpact("OUTCOME");
      (await project.getBalance(wallet.address)).should.be.bignumber.equal(60 -(i+1)*10);
    }
  });



  it("should pay back to donor", async function() {
    (await gbp.balanceOf(project.address)).should.be.bignumber.equal(10);
    (await project.getBalance(wallet.address)).should.be.bignumber.equal(10);
    (await gbp.balanceOf(wallet.address)).should.be.bignumber.equal(0);

    await project.payBack(wallet.address);

    (await gbp.balanceOf(project.address)).should.be.bignumber.equal(0);
    (await gbp.balanceOf(wallet.address)).should.be.bignumber.equal(10);
  });

});
