var ProjectWithBonds = artifacts.require("ProjectWithBonds");
var ProjectCatalog = artifacts.require("ProjectCatalog");
var Coupon = artifacts.require("Coupon");
var InvestmentWallet = artifacts.require("InvestmentWallet");
var AliceToken = artifacts.require("AliceToken");

const BigNumber = web3.BigNumber;

const should = require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bignumber')(BigNumber))
	.should()

contract('ProjectWithBonds', function([owner, beneficiary]) {
	var project;
	var coupon;
	var catalog;
	var wallet;
	var token;

	it("should deploy Project with Bonds contract", async function() {
		project = await ProjectWithBonds.new("Test project", 100);
		await project.setBeneficiary(beneficiary);

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
		await token.mint(wallet.address, 100);

		(await token.balanceOf(wallet.address)).should.be.bignumber.equal(100);
	});

	it("should invest and get coupons", async function() {
		await wallet.invest(AliceToken.address, 100, "TEST");

		(await token.balanceOf(wallet.address)).should.be.bignumber.equal(0);
		(await token.balanceOf(beneficiary)).should.be.bignumber.equal(100);
		(await coupon.balanceOf(wallet.address)).should.be.bignumber.equal(1);
	});

});
