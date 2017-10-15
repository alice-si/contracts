var ProjectCatalog = artifacts.require("ProjectCatalog");

const BigNumber = web3.BigNumber

const should = require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bignumber')(BigNumber))
	.should()

contract('ProjectCatalog', function(accounts) {
	var owner = accounts[0];
	var projectCatalog;

	before("deploy Privileged contract", async function() {
		projectCatalog = await ProjectCatalog.new();
	});

	it("should correctly set initial owner", async function() {
		// (await ownableWithRecovery.owner()).should.be.equal(initialOwner);
		//
		// (await ownableWithRecovery.recoveryVote(recovery1)).should.be.equal(initialOwner);
		// (await ownableWithRecovery.recoveryVote(recovery2)).should.be.equal(initialOwner);
		// (await ownableWithRecovery.recoveryVote(recovery3)).should.be.equal(initialOwner);
		//
		// (await ownableWithRecovery.voteCount(initialOwner)).should.be.bignumber.equal(3);
	});

});
