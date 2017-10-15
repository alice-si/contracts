var OwnableWithRecovery     = artifacts.require("OwnableWithRecovery");

const BigNumber = web3.BigNumber

const should = require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bignumber')(BigNumber))
	.should()

contract('OwnableWithRecover', function(accounts) {
	var initialOwner = accounts[0];
	var recovery1 = accounts[1];
	var recovery2 = accounts[2];
	var recovery3 = accounts[3];
	var newOwner = accounts[4];
	var ownableWithRecovery;

	beforeEach("deploy Privileged contract", async function() {
		ownableWithRecovery = await OwnableWithRecovery.new([recovery1, recovery2, recovery3], 2);
	});

	it("should correctly set initial owner", async function() {
		(await ownableWithRecovery.owner()).should.be.equal(initialOwner);

		(await ownableWithRecovery.recoveryVote(recovery1)).should.be.equal(initialOwner);
		(await ownableWithRecovery.recoveryVote(recovery2)).should.be.equal(initialOwner);
		(await ownableWithRecovery.recoveryVote(recovery3)).should.be.equal(initialOwner);

		(await ownableWithRecovery.voteCount(initialOwner)).should.be.bignumber.equal(3);
	});





});
