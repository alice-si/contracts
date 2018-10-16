var Project = artifacts.require("Project");
var AliceToken = artifacts.require("AliceToken");
var ImpactRegistry = artifacts.require("ImpactRegistry");

require("../test-setup");

contract('Multiple donations', function(accounts) {
  var main = accounts[0];
  var validator = accounts[1];
  var beneficiary = accounts[2];
  var project, token;

  it("should create a project", async function() {
    project = await Project.new("Project", 0);
  });


  it("should link the project to token", async function() {
    token = await AliceToken.new();
    await project.setToken(token.address, {from: main})
  });


  it("should link the project to validator", async function() {
    await project.setValidator(validator);
    (await project.validatorAddress()).should.be.equal(validator);
  });


  it("should link project to beneficiary", async function() {
    await project.setBeneficiary(beneficiary);
    (await project.beneficiaryAddress()).should.be.equal(beneficiary);
  });


  it("should link project to impact registry", async function() {
    impactRegistry = await ImpactRegistry.new(project.address);
    await project.setImpactRegistry(impactRegistry.address, {from: main});
  });


  it("should donate from multiple accounts", async function() {
    for (var i = 0; i < 50; i++) {
      var account = accounts[5+i];
      await project.notify(account, 10, {from: main});
    }

    await token.mint(project.address, 500);
    (await token.balanceOf(project.address)).should.be.bignumber.equal(500);
  });


  it("should validate outcome from multiple accounts", async function () {
    //Before
    (await token.balanceOf(project.address)).should.be.bignumber.equal(500);
    (await token.balanceOf(beneficiary)).should.be.bignumber.equal(0);

    await project.validateOutcome("Outcome", 500, {from: validator});

    //After
    (await token.balanceOf(project.address)).should.be.bignumber.equal(0);
    (await token.balanceOf(beneficiary)).should.be.bignumber.equal(500);
  });


});
