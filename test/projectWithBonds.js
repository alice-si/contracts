var ProjectWithBonds = artifacts.require("ProjectWithBonds");
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

contract('ProjectWithBonds', function([owner, beneficiary, judge, donor]) {
	var project;
	var coupon;
	var catalog;
	var wallet;
	var token;
	var donationWallet;
	var registry;
	var linker;

	it("should deploy Project with Bonds contract", async function() {
		project = await ProjectWithBonds.new("Test project", 100, 1000);
		registry = await ImpactRegistry.new(project.address);
		linker = await Linker.new(registry.address, 10);
		await registry.setLinker(linker.address);

		await project.setImpactRegistry(registry.address);
		await project.setBeneficiary(beneficiary);
		await project.setJudge(judge);

		catalog = await ProjectCatalog.new();
		await catalog.addProject("TEST", project.address);

		(await project.couponNominalPrice()).should.be.bignumber.equal(100);
	});

	it("should create coupon contract", async function() {
		let couponAddress = await project.getCoupon();
		coupon = await Coupon.at(couponAddress);

		(await coupon.name()).should.be.equal("Alice Coupon");
		(await coupon.nominalPrice()).should.be.bignumber.equal(100);
	});

	it("should configure investment wallet", async function() {
		wallet = await InvestmentWallet.new(catalog.address);
		token = await AliceToken.deployed();
		await project.setToken(token.address);

		await token.mint(wallet.address, 100);

		(await token.balanceOf(wallet.address)).should.be.bignumber.equal(100);
	});

	it("should invest and get coupons", async function() {
		await wallet.invest(100, "TEST");

		(await token.balanceOf(wallet.address)).should.be.bignumber.equal(0);
		(await token.balanceOf(beneficiary)).should.be.bignumber.equal(100);
		(await coupon.balanceOf(wallet.address)).should.be.bignumber.equal(1);

		(await project.getLiability()).should.be.bignumber.equal(110);
		(await project.getValidatedLiability()).should.be.bignumber.equal(0);
	});

	it("should donate to the project", async function() {
		donationWallet = await DonationWallet.new(catalog.address);
		await token.mint(donationWallet.address, 120);
		await donationWallet.donate(120, "TEST");

		(await token.balanceOf(project.address)).should.be.bignumber.equal(120);
	});

	it("should validate liability", async function() {
		await project.unlockOutcome("OUTCOME", 110, {from: judge});

		(await project.getLiability()).should.be.bignumber.equal(110);
		(await project.getValidatedLiability()).should.be.bignumber.equal(110);
	});

	it("should redeem coupon", async function() {
		await wallet.redeemCoupons(1, "TEST");

		(await project.getLiability()).should.be.bignumber.equal(0);
		(await project.getValidatedLiability()).should.be.bignumber.equal(0);
		(await token.balanceOf(wallet.address)).should.be.bignumber.equal(110);
	});

	it("should link impact", async function() {
		await registry.linkImpact("OUTCOME");
		await registry.linkImpact("OUTCOME");
		await registry.linkImpact("OUTCOME");
		await registry.linkImpact("OUTCOME");
		await registry.linkImpact("OUTCOME");
		await registry.linkImpact("OUTCOME");
		await registry.linkImpact("OUTCOME");
		await registry.linkImpact("OUTCOME");
		await registry.linkImpact("OUTCOME");
		await registry.linkImpact("OUTCOME");
		await registry.linkImpact("OUTCOME");
		(await project.getBalance(donationWallet.address)).should.be.bignumber.equal(10);
	});



	it("should pay back to donor", async function() {
		(await token.balanceOf(project.address)).should.be.bignumber.equal(10);
		(await project.getBalance(donationWallet.address)).should.be.bignumber.equal(10);

		await project.payBack(donationWallet.address);

		(await token.balanceOf(project.address)).should.be.bignumber.equal(0);
		(await token.balanceOf(donationWallet.address)).should.be.bignumber.equal(10);


	});

});

contract('ProjectWithBonds - mixed investment and donations', function([owner, beneficiary, judge, donor]) {
	var project;
	var coupon;
	var catalog;
	var wallet;
	var token;
	var donationWallet;
	var registry;
	var linker;

	it("should deploy Project with Bonds contract", async function() {
		project = await ProjectWithBonds.new("Test project", 100, 1000);
		registry = await ImpactRegistry.new(project.address);
		linker = await Linker.new(registry.address, 10);
		await registry.setLinker(linker.address);

		await project.setImpactRegistry(registry.address);
		await project.setBeneficiary(beneficiary);
		await project.setJudge(judge);

		catalog = await ProjectCatalog.new();
		await catalog.addProject("TEST", project.address);

		(await project.couponNominalPrice()).should.be.bignumber.equal(100);
	});

	it("should create coupon contract", async function() {
		let couponAddress = await project.getCoupon();
		coupon = await Coupon.at(couponAddress);

		(await coupon.name()).should.be.equal("Alice Coupon");
		(await coupon.nominalPrice()).should.be.bignumber.equal(100);
	});

	it("should configure investment wallet", async function() {
		wallet = await InvestmentWallet.new(catalog.address);
		token = await AliceToken.deployed();
		await project.setToken(token.address);

		await token.mint(wallet.address, 100);

		(await token.balanceOf(wallet.address)).should.be.bignumber.equal(100);
	});

	it("should invest and get coupons", async function() {
		await wallet.invest(100, "TEST");

		(await token.balanceOf(wallet.address)).should.be.bignumber.equal(0);
		(await token.balanceOf(beneficiary)).should.be.bignumber.equal(100);
		(await coupon.balanceOf(wallet.address)).should.be.bignumber.equal(1);

		(await project.getLiability()).should.be.bignumber.equal(110);
		(await project.getValidatedLiability()).should.be.bignumber.equal(0);
	});

	it("should donate to the project", async function() {
		donationWallet = await DonationWallet.new(catalog.address);
		await token.mint(donationWallet.address, 120);
		await donationWallet.donate(120, "TEST");

		(await token.balanceOf(project.address)).should.be.bignumber.equal(120);
	});

	it("should validate liability", async function() {
		await project.unlockOutcome("OUTCOME", 110, {from: judge});

		(await project.getLiability()).should.be.bignumber.equal(110);
		(await project.getValidatedLiability()).should.be.bignumber.equal(110);
		(await project.total()).should.be.bignumber.equal(10);
	});

	it("should donate more to the project", async function() {
		await token.mint(donationWallet.address, 120);
		await donationWallet.donate(120, "TEST");

		(await project.total()).should.be.bignumber.equal(130);
	});

	it("should validate second outcome", async function() {
		await project.unlockOutcome("OUTCOME2", 110, {from: judge});

		(await project.getLiability()).should.be.bignumber.equal(110);
		(await project.getValidatedLiability()).should.be.bignumber.equal(110);
		(await project.total()).should.be.bignumber.equal(20);
		(await token.balanceOf(beneficiary)).should.be.bignumber.equal(210);
	});

	it("should redeem coupon", async function() {
		await wallet.redeemCoupons(1, "TEST");

		(await project.getLiability()).should.be.bignumber.equal(0);
		(await project.getValidatedLiability()).should.be.bignumber.equal(0);
		(await token.balanceOf(wallet.address)).should.be.bignumber.equal(110);
	});

	it("should link impact", async function() {
		await registry.linkImpact("OUTCOME");
		await registry.linkImpact("OUTCOME");
		await registry.linkImpact("OUTCOME");
		await registry.linkImpact("OUTCOME");
		await registry.linkImpact("OUTCOME");
		await registry.linkImpact("OUTCOME");
		await registry.linkImpact("OUTCOME");
		await registry.linkImpact("OUTCOME");
		await registry.linkImpact("OUTCOME");
		await registry.linkImpact("OUTCOME");
		await registry.linkImpact("OUTCOME");

		await registry.linkImpact("OUTCOME2");
		await registry.linkImpact("OUTCOME2");
		await registry.linkImpact("OUTCOME2");
		await registry.linkImpact("OUTCOME2");
		await registry.linkImpact("OUTCOME2");
		await registry.linkImpact("OUTCOME2");
		await registry.linkImpact("OUTCOME2");
		await registry.linkImpact("OUTCOME2");
		await registry.linkImpact("OUTCOME2");
		await registry.linkImpact("OUTCOME2");
		await registry.linkImpact("OUTCOME2");
		(await project.getBalance(donationWallet.address)).should.be.bignumber.equal(20);
	});




	it("should pay back to donor", async function() {
		(await token.balanceOf(project.address)).should.be.bignumber.equal(20);
		(await project.getBalance(donationWallet.address)).should.be.bignumber.equal(20);

		await project.payBack(donationWallet.address);

		(await token.balanceOf(project.address)).should.be.bignumber.equal(0);
		(await token.balanceOf(donationWallet.address)).should.be.bignumber.equal(20);


	});

});

