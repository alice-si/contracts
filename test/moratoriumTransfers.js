var MoratoriumTransfers = artifacts.require("MoratoriumTransfers");
var AliceToken = artifacts.require("AliceToken");

require("./helper").prepare();

const increaseTime = function(duration) {
	const id = Date.now();

	return new Promise((resolve, reject) => {
		web3.currentProvider.sendAsync({
			jsonrpc: '2.0',
			method: 'evm_increaseTime',
			params: [duration],
			id: id,
		}, err1 => {
			if (err1) return reject(err1)

			web3.currentProvider.sendAsync({
				jsonrpc: '2.0',
				method: 'evm_mine',
				id: id+1,
			}, (err2, res) => {
				return err2 ? reject(err2) : resolve(res)
			})
		})
	})
}

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

	it("should create transfer proposal", async function() {
		const {logs} = await moratoriumTransfers.proposeTransfer(token.address, target, 100);
		const event = logs.find(e => e.event === 'TransferProposed');
		proposalId = event.args.id;
	});

	it("should fail to confirm the transfer before moratorium period", async function() {
		await moratoriumTransfers.confirmTransfer(proposalId).shouldBeReverted();
	});

	it("should confirm the transfer after moratorium", async function() {
		await increaseTime(MORATORIUM_PERIOD + 1);
		await moratoriumTransfers.confirmTransfer(proposalId);

		(await token.balanceOf(moratoriumTransfers.address)).should.be.bignumber.equal(0);
		(await token.balanceOf(target)).should.be.bignumber.equal(100);
	});

});
