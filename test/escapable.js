var Escapable = artifacts.require("Escapable");
var AliceToken = artifacts.require("AliceToken");

const BigNumber = web3.BigNumber

const should = require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bignumber')(BigNumber))
	.should()

contract('Escapable', function(accounts) {
	var escapeController = accounts[1];
	var escapeTarget = accounts[2];
	var newController = accounts[3];
	var escapable;
	var token;

	beforeEach("deploy Escapable and deposit tokens", async function() {
		escapable = await Escapable.new(escapeController, escapeTarget);
		token = await AliceToken.deployed();
		await token.mint(escapable.address, 100);
	});

	it("should correctly deposit tokens", async function() {
		(await token.balanceOf(escapable.address)).should.be.bignumber.equal(100);
	});

	it("should prevent escaping from non controller", async function() {
		escapable.escape(token.address, {from: newController}).should.be.rejectedWith('VM Exception while processing transaction: revert');
	});

	it("should allow changing controller", async function() {
		await escapable.changeEscapeController(newController, {from: escapeController});

		(await escapable.escapeController()).should.be.equal(newController);
	});

	it("should escape funds", async function() {
		await escapable.escape(token.address, {from: escapeController});

		(await token.balanceOf(escapable.address)).should.be.bignumber.equal(0);
		(await token.balanceOf(escapeTarget)).should.be.bignumber.equal(100);
	});

});
