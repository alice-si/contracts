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
		project = await ProjectWithBonds.new("Test project");

	});

	it("should create coupon contract", async function() {
		let couponAddress = await project.getCoupon();
		coupon = await Coupon.at(couponAddress);
		let couponName = await coupon.name();
		couponName.should.be.equal("Alice Coupon");
	});

});
