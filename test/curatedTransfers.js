var CuratedTransfers = artifacts.require("CuratedTransfers");
var AliceToken = artifacts.require("AliceToken");

require("./helper").prepare();

contract('CuratedTransfers', function(accounts) {
	var curatedTransfers;
	var curator = accounts[1];
	var target = accounts[3];
	var token;
	var proposalId;

	before("deploy CuratedTransfers and deposit tokens", async function() {
		curatedTransfers = await CuratedTransfers.new(curator, [], []);
		token = await AliceToken.deployed();
		await token.mint(curatedTransfers.address, 100);
	});

	it("should correctly deposit tokens", async function() {
		(await token.balanceOf(curatedTransfers.address)).should.be.bignumber.equal(100);
	});

	it("should create transfer proposal", async function() {
		const {logs} = await curatedTransfers.proposeTransfer(token.address, target, 100);
		const event = logs.find(e => e.event === 'TransferProposed');
		proposalId = event.args.id;
	});

	it("should fail to block transfer for non curators", async function() {
		await curatedTransfers.blockTransfer(proposalId).should.be.rejectedWith('VM Exception while processing transaction: revert');
	});

	it("should allow blocking transfer for curators", async function() {
		await curatedTransfers.blockTransfer(proposalId, {from: curator});
	});

	it("should fail to confirm blocked transfer", async function() {
		await curatedTransfers.confirmTransfer(proposalId).should.be.rejectedWith('VM Exception while processing transaction: revert');
	});

	it("should fail to resume blocked transfer for non curators", async function() {
		await curatedTransfers.resumeTransfer(proposalId).should.be.rejectedWith('VM Exception while processing transaction: revert');
	});

	it("should allow resuming blocked transfer for curators", async function() {
		await curatedTransfers.resumeTransfer(proposalId, {from: curator});
	});

	it("should confirm resumed transfer", async function() {
		await curatedTransfers.confirmTransfer(proposalId);

		(await token.balanceOf(curatedTransfers.address)).should.be.bignumber.equal(0);
		(await token.balanceOf(target)).should.be.bignumber.equal(100);
	});

});
