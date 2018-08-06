var TwoPhaseTransfers = artifacts.require("TwoPhaseTransfers");
var AliceToken = artifacts.require("AliceToken");

require("./helper").prepare();

contract('TwoPhaseTransfers', function(accounts) {
	var twoPhaseTransfers;
	var proposer = accounts[1];
	var validator = accounts[2];
	var target = accounts[3];
	var token;
	var proposalId;

	before("deploy Escapable and deposit tokens", async function() {
		twoPhaseTransfers = await TwoPhaseTransfers.new([proposer], [validator]);
		token = await AliceToken.deployed();
		await token.mint(twoPhaseTransfers.address, 100);
	});

	it("should correctly deposit tokens", async function() {
		(await token.balanceOf(twoPhaseTransfers.address)).should.be.bignumber.equal(100);
	});

	it("should prevent proposing transfer from unauthorized account", async function() {
		await twoPhaseTransfers.proposeTransfer(token.address, target, 100, {from: validator}).shouldBeReverted();
	});

	it("should allow proposing transfer from authorized account", async function() {
		const {logs} = await twoPhaseTransfers.proposeTransfer(token.address, target, 100, {from: proposer});
		const event = logs.find(e => e.event === 'TransferProposed');
		proposalId = event.args.id;

		event.args.token.should.equal(token.address);
		event.args.to.should.equal(target);
		event.args.value.should.bignumber.equal(100);
	});

	it("should prevent confirming transfer from unauthorized account", async function() {
		await twoPhaseTransfers.confirmTransfer(proposalId, {from: proposer}).shouldBeReverted();
	});

	it("should allow confirming transfer from authorized account", async function() {
		const {logs} = await twoPhaseTransfers.confirmTransfer(proposalId, {from: validator});
		const event = logs.find(e => e.event === 'TransferConfirmed');

		event.args.id.should.bignumber.equal(proposalId);
		event.args.token.should.equal(token.address);
		event.args.to.should.equal(target);
		event.args.value.should.bignumber.equal(100);

		(await token.balanceOf(twoPhaseTransfers.address)).should.be.bignumber.equal(0);
		(await token.balanceOf(target)).should.be.bignumber.equal(100);
	});

});
