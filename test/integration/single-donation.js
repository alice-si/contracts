var Project = artifacts.require("Project");
var ProjectCatalog = artifacts.require("ProjectCatalog");
var Coupon = artifacts.require("Coupon");
var InvestmentWallet = artifacts.require("InvestmentWallet");
var DonationWallet = artifacts.require("DonationWallet");
var AliceToken = artifacts.require("AliceToken");
var ImpactRegistry = artifacts.require("ImpactRegistry");
var Linker = artifacts.require("FlexibleImpactLinker");

const BigNumber = web3.BigNumber;

const should = require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bignumber')(BigNumber))
	.should()

contract('Project - single donation', function([owner, beneficiary, judge, donor]) {
	var project;
	var coupon;
	var catalog;
	var wallet;
	var token;
	var donationWallet;
	var registry;
	var linker;

	it("should deploy Project with Bonds contract", async function() {
		project = await Project.new("TEST");
		registry = await ImpactRegistry.new(project.address);
		linker = await Linker.new(registry.address, 10);
		token = await AliceToken.new();

		await registry.setLinker(linker.address);
		await project.setImpactRegistry(registry.address);
		await project.setBeneficiary(beneficiary);
		await project.setJudge(judge);
		await project.setToken(token.address);

		catalog = await ProjectCatalog.new();
		await catalog.addProject("TEST", project.address);
	});

	it("should donate", async function() {
		wallet = await DonationWallet.new(catalog.address);
		await token.mint(wallet.address, 100);
		await wallet.donate(100, "TEST");
	});

	it("should validate", async function() {
		await project.unlockOutcome("OUTCOME", 100, {from: judge});
		await registry.linkImpact("OUTCOME");
	});

	//
	// it("should configure investment wallet", async function() {
	// 	wallet = await InvestmentWallet.new(catalog.address);
	// 	token = await AliceToken.deployed();
	// 	await project.setToken(token.address);
	//
	// 	await token.mint(wallet.address, 100);
	//
	// 	(await token.balanceOf(wallet.address)).should.be.bignumber.equal(100);
	// });
	//
	// it("should invest and get coupons", async function() {
	// 	await wallet.invest(100, "TEST");
	//
	// 	(await token.balanceOf(wallet.address)).should.be.bignumber.equal(0);
	// 	(await token.balanceOf(beneficiary)).should.be.bignumber.equal(100);
	// 	(await coupon.balanceOf(wallet.address)).should.be.bignumber.equal(1);
	//
	// 	(await project.getLiability()).should.be.bignumber.equal(110);
	// 	(await project.getValidatedLiability()).should.be.bignumber.equal(0);
	// });
	//
	// it("should donate to the project", async function() {
	// 	donationWallet = await DonationWallet.new(catalog.address);
	// 	await token.mint(donationWallet.address, 120);
	// 	await donationWallet.donate(120, "TEST");
	//
	// 	(await token.balanceOf(project.address)).should.be.bignumber.equal(120);
	// });
	//
	// it("should validate liability", async function() {
	// 	await project.unlockOutcome("OUTCOME", 110, {from: judge});
	//
	// 	(await project.getLiability()).should.be.bignumber.equal(110);
	// 	(await project.getValidatedLiability()).should.be.bignumber.equal(110);
	// });
	//
	// it("should redeem coupon", async function() {
	// 	await wallet.redeemCoupons(1, "TEST");
	//
	// 	(await project.getLiability()).should.be.bignumber.equal(0);
	// 	(await project.getValidatedLiability()).should.be.bignumber.equal(0);
	// 	(await token.balanceOf(wallet.address)).should.be.bignumber.equal(110);
	// });
	//
	// it("should link impact", async function() {
	// 	await registry.linkImpact("OUTCOME");
	// 	await registry.linkImpact("OUTCOME");
	// 	await registry.linkImpact("OUTCOME");
	// 	await registry.linkImpact("OUTCOME");
	// 	await registry.linkImpact("OUTCOME");
	// 	await registry.linkImpact("OUTCOME");
	// 	await registry.linkImpact("OUTCOME");
	// 	await registry.linkImpact("OUTCOME");
	// 	await registry.linkImpact("OUTCOME");
	// 	await registry.linkImpact("OUTCOME");
	// 	await registry.linkImpact("OUTCOME");
	// 	(await project.getBalance(donationWallet.address)).should.be.bignumber.equal(10);
	// });
	//
	//
	//
	// it("should pay back to donor", async function() {
	// 	(await token.balanceOf(project.address)).should.be.bignumber.equal(10);
	// 	(await project.getBalance(donationWallet.address)).should.be.bignumber.equal(10);
	//
	// 	await project.payBack(donationWallet.address);
	//
	// 	(await token.balanceOf(project.address)).should.be.bignumber.equal(0);
	// 	(await token.balanceOf(donationWallet.address)).should.be.bignumber.equal(10);
	//
	//
	// });

});
