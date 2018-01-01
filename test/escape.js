Project = artifacts.require("project");
var SimpleContractRegistry = artifacts.require("SimpleContractRegistry");
var AliceToken = artifacts.require("AliceToken");
const BigNumber = web3.BigNumber;

const should = require('chai')
	.use(require('chai-as-promised'))
	.use(require('chai-bignumber')(BigNumber))
	.should();

contract('Escape', function(accounts) {
  var project, contractProvider, token;
  var main = accounts[0];
  var donor = accounts[1];
  var escapeAddress = accounts[2];

  it("should link project to contract provider", async function() {
		project = await Project.new("Test project");
    contractProvider = await SimpleContractRegistry.deployed();
		await project.setContractProvider(contractProvider.address, {from: main});

  });

  it("should get token contract from registry", async function() {
    var tokenAddress = await contractProvider.contracts.call('digitalGBP');
    token = await AliceToken.at(tokenAddress);
    assert.notEqual(token, undefined);
  });

  it("should mint tokens to project account", async function () {
		(await token.balanceOf(project.address)).should.be.bignumber.equal(0);

    await token.mint(project.address, 30, {from: main, gas: 300000});
    await project.fund(30);

		(await token.balanceOf(project.address)).should.be.bignumber.equal(30);
		(await project.total.call()).should.be.bignumber.equal(30);
  });

  it("should allow escape to secure address", async function () {
    await project.escape(escapeAddress);

		(await token.balanceOf(project.address)).should.be.bignumber.equal(0);
		(await token.balanceOf(escapeAddress)).should.be.bignumber.equal(30);
  });

});
