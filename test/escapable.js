var Escapable = artifacts.require("Escapable");
var AliceToken = artifacts.require("AliceToken");

const BigNumber = web3.BigNumber

const should = require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bignumber')(BigNumber))
	.should()

contract('ProjectCatalog', function(accounts) {
	var escapeController = accounts[1];
	var escapeTarget = accounts[2];
	var escapable;
	var token;

	before("deploy Escapable and deposit tokens", async function() {
		escapable = await Escapable.new(escapeController, escapeTarget);
		token = await AliceToken.deployed();
		await token.mint(escapable.address, 100);
	});

	it("should correctly deposit tokens", async function() {
		(await token.balanceOf(escapable.address)).should.be.bignumber.equal(100);
	});

});
