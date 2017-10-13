var Project = artifacts.require("project");
var DonationWallet = artifacts.require("DonationWallet");
var AliceToken = artifacts.require("AliceToken");

const BigNumber = web3.BigNumber;

const should = require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bignumber')(BigNumber))
	.should();

contract('DonationWallet', function(accounts) {
	var token;
	var wallet;
	var project;
	var donor = accounts[0];

	it("should deposit tokens to donation wallet", async function() {
		token = await AliceToken.deployed();
	  wallet = await DonationWallet.new();
	  await token.mint(wallet.address, 100);

	  (await wallet.balance(token.address)).should.be.bignumber.equal(100);
	});

	it("should refund outstanding tokens", async function() {
		await wallet.refund(token.address, 50);

		(await wallet.balance(token.address)).should.be.bignumber.equal(50);
		(await token.balanceOf(donor)).should.be.bignumber.equal(50);
	});

	it("should donate from wallet", async function() {
		project = await Project.deployed();
		await wallet.donate(token.address, 50, project.address);

		(await wallet.balance(token.address)).should.be.bignumber.equal(0);
		(await project.getBalance(donor)).should.be.bignumber.equal(50);
	});



});
