var ProjectWithBonds = artifacts.require("ProjectWithBonds");
var Coupon = artifacts.require("Coupon");

const BigNumber = web3.BigNumber;

const should = require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bignumber')(BigNumber))
	.should()

contract('ProjectWithBonds', function(accounts) {
	var owner = accounts[0];
	var project;
	var coupon;

	it("should deploy Project with Bonds contract", async function() {
		project = await ProjectWithBonds.new("Test project", 100);

		(await project.couponNominalPrice()).should.be.bignumber.equal(100);
	});

	it("should create coupon contract", async function() {
		let couponAddress = await project.getCoupon();
		coupon = await Coupon.at(couponAddress);

		(await coupon.name()).should.be.equal("Alice Coupon");
		(await coupon.nominalPrice()).should.be.bignumber.equal(100);
	});

});
