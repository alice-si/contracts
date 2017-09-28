var Charity = artifacts.require("Charity");
var SimpleContractRegistry = artifacts.require("SimpleContractRegistry");
var AliceToken = artifacts.require("AliceToken");
var ImpactRegistry = artifacts.require("ImpactRegistry");
var Linker = artifacts.require("SmartImpactLinker");

const BigNumber = web3.BigNumber

const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should()

contract('Smart Impact Linker', function(accounts) {
    var main = accounts[0];
    var donor = accounts[1];
    var judge = accounts[3];
    var beneficiary = accounts[4];
    var registry, linker;

    it("should attach and configure linker", async function() {
        registry = await ImpactRegistry.deployed();
        linker = await Linker.new(registry.address, 10);

        (await linker.unit()).should.be.bignumber.equal(10);
        (await linker.registry()).should.be.equal(registry.address);
    });



});
