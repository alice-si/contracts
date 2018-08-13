var Project = artifacts.require("Project");
var ProjectWithBonds = artifacts.require("ProjectWithBonds");
var ProjectCatalog = artifacts.require("ProjectCatalog");
var Coupon = artifacts.require("Coupon");
var InvestmentWallet = artifacts.require("InvestmentWallet");
var DonationWallet = artifacts.require("DonationWallet");
var AliceToken = artifacts.require("AliceToken");
var ImpactRegistry = artifacts.require("ImpactRegistry");
var Linker = artifacts.require("FlexibleImpactLinker");

require("../test-setup");

contract('Project - single donation', function([owner, beneficiary, validator, donor]) {
	var project;
	var projectWithBonds;
	var coupon;
	var catalog;
	var wallet;
	var investementWallet;
	var token;
	var donationWallet;
	var registry;
	var registryForProjectWithBonds;
	var linker;

	it("should deploy Project with Bonds contract", async function() {
		project = await Project.new("TEST");
		projectWithBonds = await ProjectWithBonds.new("TEST_WITH_BONDS", 100, 1000);
		registry = await ImpactRegistry.new(project.address);
    registryForProjectWithBonds = await ImpactRegistry.new(projectWithBonds.address);
		linker = await Linker.new(registry.address, 10);
    token = await AliceToken.deployed();

		await registry.setLinker(linker.address);
		await project.setImpactRegistry(registry.address);
		await project.setBeneficiary(beneficiary);
		await project.setValidator(validator);
		await project.setToken(token.address);

    await registry.setLinker(linker.address);
    await projectWithBonds.setImpactRegistry(registryForProjectWithBonds.address);
    await projectWithBonds.setBeneficiary(beneficiary);
    await projectWithBonds.setValidator(validator);
    await projectWithBonds.setToken(token.address);
    coupon = Coupon.at(await projectWithBonds.getCoupon());

		catalog = await ProjectCatalog.new();
		await catalog.addProject("TEST", project.address);
    await catalog.addProject("TEST_WITH_BONDS", projectWithBonds.address);
	});

  it("should donate", async function() {
    wallet = await DonationWallet.new(catalog.address);
    await token.mint(wallet.address, 1000);
    await wallet.donate(1000, "TEST");
  });

	it("should validate", async function() {
		await project.validateOutcome("OUTCOME", 100, {from: validator});
		await registry.linkImpact("OUTCOME");
	});


	it("should configure investment wallet", async function() {
		investementWallet = await InvestmentWallet.new(catalog.address);

		await token.mint(investementWallet.address, 100);

		(await token.balanceOf(investementWallet.address)).should.be.bignumber.equal(100);
	});

	it("should invest and get coupons", async function() {
		(await token.balanceOf(beneficiary)).should.be.bignumber.equal(100);
		await investementWallet.invest(100, "TEST_WITH_BONDS");

		(await token.balanceOf(investementWallet.address)).should.be.bignumber.equal(0);
		(await token.balanceOf(beneficiary)).should.be.bignumber.equal(200);
		(await coupon.balanceOf(investementWallet.address)).should.be.bignumber.equal(1);

		(await projectWithBonds.getLiability()).should.be.bignumber.equal(110);
		(await projectWithBonds.getValidatedLiability()).should.be.bignumber.equal(0);
	});

	it("should donate to the project", async function() {
		donationWallet = await DonationWallet.new(catalog.address);
		await token.mint(donationWallet.address, 120);
		await donationWallet.donate(120, "TEST_WITH_BONDS");

		(await token.balanceOf(projectWithBonds.address)).should.be.bignumber.equal(120);
	});

	it("should validate liability", async function() {
		await projectWithBonds.validateOutcome("OUTCOME", 110, {from: validator});

		(await projectWithBonds.getLiability()).should.be.bignumber.equal(110);
		(await projectWithBonds.getValidatedLiability()).should.be.bignumber.equal(110);
	});

	it("should redeem coupon", async function() {
		await investementWallet.redeemCoupons(1, "TEST_WITH_BONDS");

		(await projectWithBonds.getLiability()).should.be.bignumber.equal(0);
		(await projectWithBonds.getValidatedLiability()).should.be.bignumber.equal(0);
		(await token.balanceOf(investementWallet.address)).should.be.bignumber.equal(110);
	});

	it("should link impact", async function() {
    (await project.getBalance(wallet.address)).should.be.bignumber.equal(990);
		for (var i = 0; i < 5; i++) {
      await registry.linkImpact("OUTCOME");
		}
		(await project.getBalance(wallet.address)).should.be.bignumber.equal(940);
	});

	it("should link limited number of impacts", async function() {
    for (var i = 0; i < 10; i++) {
      await registry.linkImpact("OUTCOME");
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
