var Project = artifacts.require("Project");
var AlternativeToken = artifacts.require("DigitalEURToken");
var ProjectCatalog = artifacts.require("ProjectCatalog");
var DonationWallet = artifacts.require("DonationWallet");
var Gbp = artifacts.require("DigitalGBPToken");
var ImpactRegistry = artifacts.require("ImpactRegistry");
var Linker = artifacts.require("FlexibleImpactLinker");


require("../test-setup");

contract('Project - single donation', function([owner, beneficiary, validator, donor, transformationService]) {
  var project;
  var mainToken;
  var alternativeToken;

  it("should deploy Project contract", async function() {
    project = await Project.new("TEST", 0);
    registry = await ImpactRegistry.new(project.address);
    linker = await Linker.new(registry.address, 10);

    mainToken = await Gbp.new();
    alternativeToken = await AlternativeToken.new();

    await registry.setLinker(linker.address);
    await project.setImpactRegistry(registry.address);
    await project.setBeneficiary(beneficiary);
    await project.setValidator(validator);
    await project.setToken(mainToken.address);

    catalog = await ProjectCatalog.new();
    await catalog.addProject("TEST", project.address);
  });


  it("should process a standard donation", async function() {
    wallet = await DonationWallet.new(catalog.address);
    await mainToken.mint(wallet.address, 60);
    await wallet.donate(60, "TEST");
  });


  it("should record a standard donation", async function() {
    (await mainToken.balanceOf(project.address)).should.be.bignumber.equal(60);
    (await mainToken.balanceOf(beneficiary)).should.be.bignumber.equal(0);

    (await alternativeToken.balanceOf(project.address)).should.be.bignumber.equal(0);

    (await project.getBalance(wallet.address)).should.be.bignumber.equal(60);
  });


  it("should record an alternative donation", async function() {
    await alternativeToken.mint(project.address, 40);

    (await mainToken.balanceOf(project.address)).should.be.bignumber.equal(60);
    (await mainToken.balanceOf(beneficiary)).should.be.bignumber.equal(0);

    (await alternativeToken.balanceOf(project.address)).should.be.bignumber.equal(40);

    (await project.getBalance(wallet.address)).should.be.bignumber.equal(60);
  });


  it("should transform an alternative donation step 1", async function() {
    await project.reclaimAlternativeTokens(alternativeToken.address, transformationService, 40);

    (await mainToken.balanceOf(project.address)).should.be.bignumber.equal(60);
    (await mainToken.balanceOf(beneficiary)).should.be.bignumber.equal(0);

    (await alternativeToken.balanceOf(project.address)).should.be.bignumber.equal(0);
    (await alternativeToken.balanceOf(transformationService)).should.be.bignumber.equal(40);

    (await project.getBalance(wallet.address)).should.be.bignumber.equal(60);

  });


  it("should transform an alternative donation step 2", async function() {
    await alternativeToken.burn(transformationService, 40);
    await mainToken.mint(project.address, 40);
    await project.notify(wallet.address, 40);

    (await mainToken.balanceOf(project.address)).should.be.bignumber.equal(100);
    (await mainToken.balanceOf(beneficiary)).should.be.bignumber.equal(0);

    (await alternativeToken.balanceOf(project.address)).should.be.bignumber.equal(0);
    (await alternativeToken.balanceOf(transformationService)).should.be.bignumber.equal(0);

    (await project.getBalance(wallet.address)).should.be.bignumber.equal(100);

  });


  it("should validate", async function() {
    await project.validateOutcome("OUTCOME", 90, {from: validator});
    (await mainToken.balanceOf(project.address)).should.be.bignumber.equal(10);
    (await mainToken.balanceOf(beneficiary)).should.be.bignumber.equal(90);
  });


  it("should link impact", async function() {
    for (var i = 0; i < 9; i++) {
      await registry.linkImpact("OUTCOME");
      (await project.getBalance(wallet.address)).should.be.bignumber.equal(100 -(i+1)*10);
    }
  });


  it("should pay back to donor", async function() {
    (await mainToken.balanceOf(project.address)).should.be.bignumber.equal(10);
    (await project.getBalance(wallet.address)).should.be.bignumber.equal(10);
    (await mainToken.balanceOf(wallet.address)).should.be.bignumber.equal(0);

    await project.payBack(wallet.address);

    (await mainToken.balanceOf(project.address)).should.be.bignumber.equal(0);
    (await mainToken.balanceOf(wallet.address)).should.be.bignumber.equal(10);
  });

});
