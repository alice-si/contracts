var Project = artifacts.require("project");
var AliceToken = artifacts.require("AliceToken");
var ImpactRegistry = artifacts.require("ImpactRegistry");
var Linker = artifacts.require("FlexibleImpactLinker");

require("../test-setup");

contract('Double donations', function(accounts) {
  var main = accounts[0];
  var donor1 = accounts[1];
  var donor2 = accounts[2];
  var validator = accounts[3];
  var beneficiary = accounts[4];
  var project, token, impactRegistry;

  it("should create a project", async function() {
    project = await Project.new("Project", 0);
  });


  it("should link the project to token", async function() {
    token = await AliceToken.new();
    await project.setToken(token.address, {from: main})
  });


  it("should link the project to validator", async function() {
    await project.setValidator(validator, {from: main});
    (await project.validatorAddress()).should.be.equal(validator);
  });


  it("should link project to beneficiary", async function() {
    await project.setBeneficiary(beneficiary, {from: main});
    (await project.beneficiaryAddress()).should.be.equal(beneficiary);
  });


  it("should link project to impact registry", async function() {
      impactRegistry = await ImpactRegistry.new(project.address);
      await project.setImpactRegistry(impactRegistry.address, {from: main});
  });


  it("should notify from donor1", async function () {
    await project.notify(donor1, 10, {from: main});
   (await project.total()).should.be.bignumber.equal(10);
   (await project.getBalance(donor1)).should.be.bignumber.equal(10);
  });


  it("should notify from donor2", async function () {
    await project.notify(donor2, 20, {from: main});
    (await project.total()).should.be.bignumber.equal(30);
    (await project.getBalance(donor2)).should.be.bignumber.equal(20);
  });


  it("should mint tokens", async function () {
    await token.mint(project.address, 30);
    (await token.balanceOf(project.address)).should.be.bignumber.equal(30);
  });



  it("should validate outcome", async function () {
    //Before
    (await token.balanceOf(project.address)).should.be.bignumber.equal(30);
    (await token.balanceOf(beneficiary)).should.be.bignumber.equal(0);

    await project.validateOutcome("Outcome", 25, {from: validator});

    //After
    (await token.balanceOf(project.address)).should.be.bignumber.equal(5);
    (await token.balanceOf(beneficiary)).should.be.bignumber.equal(25);
  });


  it("should configure the linker", async function () {
		linker = await Linker.new(impactRegistry.address, 10);
		await impactRegistry.setLinker(linker.address);

		(await linker.unit()).should.be.bignumber.equal(10);
		(await linker.registry()).should.be.equal(impactRegistry.address);
  });


  it("should link impactRegistry", async function () {
    await impactRegistry.linkImpact("Outcome");
    (await impactRegistry.getImpactLinked("Outcome")).should.be.bignumber.equal(10);
    (await impactRegistry.getImpactCount("Outcome")).should.be.bignumber.equal(1);
    (await impactRegistry.getImpactDonor("Outcome", 0)).should.be.equal(donor1);
    (await impactRegistry.getImpactValue("Outcome", donor1)).should.be.bignumber.equal(10);

    await impactRegistry.linkImpact("Outcome");
    (await impactRegistry.getImpactLinked("Outcome")).should.be.bignumber.equal(20);
    (await impactRegistry.getImpactCount("Outcome")).should.be.bignumber.equal(2);
    (await impactRegistry.getImpactDonor("Outcome", 1)).should.be.equal(donor2);
    (await impactRegistry.getImpactValue("Outcome", donor2)).should.be.bignumber.equal(10);

    await impactRegistry.linkImpact("Outcome");
    (await impactRegistry.getImpactLinked("Outcome")).should.be.bignumber.equal(25);
    (await impactRegistry.getImpactCount("Outcome")).should.be.bignumber.equal(2);
    (await impactRegistry.getImpactDonor("Outcome", 1)).should.be.equal(donor2);
    (await impactRegistry.getImpactValue("Outcome", donor2)).should.be.bignumber.equal(15);

  });

  it("should pay back outstanding balance", async function () {
    //Before
    (await token.balanceOf(project.address)).should.be.bignumber.equal(5);
    (await token.balanceOf(donor1)).should.be.bignumber.equal(0);
    (await token.balanceOf(donor2)).should.be.bignumber.equal(0);

    await project.payBack(donor2);

    //After
    (await token.balanceOf(project.address)).should.be.bignumber.equal(0);
    (await token.balanceOf(donor1)).should.be.bignumber.equal(0);
    (await token.balanceOf(donor2)).should.be.bignumber.equal(5);
  });

});
