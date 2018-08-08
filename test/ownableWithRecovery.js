var OwnableWithRecovery     = artifacts.require("OwnableWithRecovery");

require("./helper").testSetup();

contract('OwnableWithRecover', function(accounts) {
	var initialOwner = accounts[0];
	var recovery1 = accounts[1];
	var recovery2 = accounts[2];
	var recovery3 = accounts[3];
	var newOwner = accounts[4];
	var ownableWithRecovery;

	before("deploy Privileged contract", async function() {
		ownableWithRecovery = await OwnableWithRecovery.new([recovery1, recovery2, recovery3], 2);
	});

	it("should correctly set initial owner", async function() {
		(await ownableWithRecovery.owner()).should.be.equal(initialOwner);

		(await ownableWithRecovery.recoveryVote(recovery1)).should.be.equal(initialOwner);
		(await ownableWithRecovery.recoveryVote(recovery2)).should.be.equal(initialOwner);
		(await ownableWithRecovery.recoveryVote(recovery3)).should.be.equal(initialOwner);

		(await ownableWithRecovery.voteCount(initialOwner)).should.be.bignumber.equal(3);
	});

	it("should attempt to update owner after vote (1/3)", async function() {
		//Attempt
		await ownableWithRecovery.transferOwnership(newOwner, {from: recovery1});

		//Voting registry
		(await ownableWithRecovery.recoveryVote(recovery1)).should.be.equal(newOwner);
		(await ownableWithRecovery.recoveryVote(recovery2)).should.be.equal(initialOwner);
		(await ownableWithRecovery.recoveryVote(recovery3)).should.be.equal(initialOwner);

		//Voting count
		(await ownableWithRecovery.voteCount(newOwner)).should.be.bignumber.equal(1);
		(await ownableWithRecovery.voteCount(initialOwner)).should.be.bignumber.equal(2);

		//Effective owner
		(await ownableWithRecovery.owner()).should.be.equal(initialOwner);
	});

	it("should attempt to update owner after vote (2/3)", async function() {
		//Attempt
		await ownableWithRecovery.transferOwnership(newOwner, {from: recovery2});

		//Voting registry
		(await ownableWithRecovery.recoveryVote(recovery1)).should.be.equal(newOwner);
		(await ownableWithRecovery.recoveryVote(recovery2)).should.be.equal(newOwner);
		(await ownableWithRecovery.recoveryVote(recovery3)).should.be.equal(initialOwner);

		//Voting count
		(await ownableWithRecovery.voteCount(newOwner)).should.be.bignumber.equal(2);
		(await ownableWithRecovery.voteCount(initialOwner)).should.be.bignumber.equal(1);

		//Effective owner
		(await ownableWithRecovery.owner()).should.be.equal(newOwner);
	});

	it("should attempt to update owner after vote (3/3)", async function() {
		//Attempt
		await ownableWithRecovery.transferOwnership(newOwner, {from: recovery3});

		//Voting registry
		(await ownableWithRecovery.recoveryVote(recovery1)).should.be.equal(newOwner);
		(await ownableWithRecovery.recoveryVote(recovery2)).should.be.equal(newOwner);
		(await ownableWithRecovery.recoveryVote(recovery3)).should.be.equal(newOwner);

		//Voting count
		(await ownableWithRecovery.voteCount(newOwner)).should.be.bignumber.equal(3);
		(await ownableWithRecovery.voteCount(initialOwner)).should.be.bignumber.equal(0);

		//Effective owner
		(await ownableWithRecovery.owner()).should.be.equal(newOwner);
	});





});
