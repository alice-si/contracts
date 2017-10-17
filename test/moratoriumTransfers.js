var MoratoriumTransfers = artifacts.require("MoratoriumTransfers");
var AliceToken = artifacts.require("AliceToken");

const BigNumber = web3.BigNumber;

const should = require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bignumber')(BigNumber))
	.should();

contract('MoratoriumTransfers', function(accounts) {
	const MORATORIUM_PERIOD = 1000;
	var moratoriumTransfers;
	var target = accounts[3];
	var token;
	var proposalId;

	before("deploy MoratoriumTransfers and deposit tokens", async function() {
		moratoriumTransfers = await MoratoriumTransfers.new(MORATORIUM_PERIOD, [], []);
		token = await AliceToken.deployed();
		await token.mint(moratoriumTransfers.address, 100);
	});

	it("should correctly deposit tokens", async function() {
		(await token.balanceOf(moratoriumTransfers.address)).should.be.bignumber.equal(100);
	});

});
