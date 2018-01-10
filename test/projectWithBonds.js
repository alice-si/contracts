var ProjectWithBonds = artifacts.require("ProjectWithBonds");
var ProjectCatalog = artifacts.require("ProjectCatalog");
var Coupon = artifacts.require("Coupon");
var InvestmentWallet = artifacts.require("InvestmentWallet");
var DonationWallet = artifacts.require("DonationWallet");
var AliceToken = artifacts.require("AliceToken");
var ImpactRegistry = artifacts.require("ImpactRegistry");

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

	it("should deploy Project with Bonds contract", async function() {
		project = await ProjectWithBonds.new("Test project", 100);
		var registry = await ImpactRegistry.new(project.address);
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

		(await project.getLiability()).should.be.bignumber.equal(100);
		(await project.getValidatedLiability()).should.be.bignumber.equal(0);
	});

	it("should donate to the project", async function() {
		donationWallet = await DonationWallet.new(catalog.address);
		await token.mint(donationWallet.address, 100);
		await donationWallet.donate(100, "TEST");

		(await token.balanceOf(project.address)).should.be.bignumber.equal(100);
	});

	it("should validate liability", async function() {
		await project.unlockOutcome("OUTCOME", 100, {from: judge});

		(await project.getLiability()).should.be.bignumber.equal(100);
		(await project.getValidatedLiability()).should.be.bignumber.equal(100);
	});

	it("should redeem coupon", async function() {
		await wallet.redeemCoupons(1, "TEST");

		//(await project.getLiability()).should.be.bignumber.equal(100);
		//(await project.getValidatedLiability()).should.be.bignumber.equal(100);
	});

});
