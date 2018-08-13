var Vault = artifacts.require("Vault");
var AliceToken = artifacts.require("AliceToken");

require("../test-setup");

contract('Vault', function(accounts) {
	var vault;
	var curator = accounts[1];
	var whistleblower = accounts[2];
	var target = accounts[3];
	var proposer = accounts[4];
	var validator = accounts[5];
	var token;
	var proposalId;

	before("deploy Vault contract and deposit tokens", async function() {
		vault = await Vault.new([whistleblower], curator, [proposer], [validator]);
		token = await AliceToken.deployed();
		await token.mint(vault.address, 100);
	});

	it("should correctly deposit tokens", async function() {
		(await token.balanceOf(vault.address)).should.be.bignumber.equal(100);
	});

	it("should create transfer proposal", async function() {
		const {logs} = await vault.proposeTransfer(token.address, target, 100, {from: proposer});
		const event = logs.find(e => e.event === 'TransferProposed');
		proposalId = event.args.id;
	});

	it("should fail to propose trnasfer for non proposer", async function() {
		await vault.proposeTransfer(token.address, target, 100, {from: validator}).shouldBeReverted();
	});

	it("should fail to block transfer for non whistleBlowers", async function() {
		await vault.blockTransfer(proposalId).shouldBeReverted();
	});

	it("should allow blocking transfer for whistleBlowers", async function() {
		await vault.blockTransfer(proposalId, {from: whistleblower});
	});

	it("shouldn't allow resuming transfer for whistleBlowers", async function() {
		await vault.resumeTransfer(proposalId, {from: whistleblower}).shouldBeReverted();
	});

	it("should allow resuming transfer for curator", async function() {
		await vault.resumeTransfer(proposalId, {from: curator});
	});

	it("shouldn't allow blocking again the same transfer", async function() {
		await vault.blockTransfer(proposalId, {from: whistleblower}).shouldBeReverted();
	});

	it("should confirm resumed transfer", async function() {
    await vault.confirmTransfer(proposalId, {from: validator});

    (await token.balanceOf(vault.address)).should.be.bignumber.equal(0);
    (await token.balanceOf(target)).should.be.bignumber.equal(100);
  });

  it("should fail to confirm transfer for non validator", async function() {
    await vault.confirmTransfer(proposalId, {from: proposer}).shouldBeReverted();
  });

});
