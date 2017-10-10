var Charity = artifacts.require("Charity");
var SimpleContractRegistry = artifacts.require("SimpleContractRegistry");
var AliceToken = artifacts.require("AliceToken");
var ImpactRegistry = artifacts.require("ImpactRegistry");
var Linker = artifacts.require("FlexibleImpactLinker");

const BigNumber = web3.BigNumber

const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should()

contract('Smart Impact Linker', function(accounts) {
    var donor1 = accounts[1];
    var donor2 = accounts[2];
    var registry, linker;

    it("should attach and configure linker", async function() {
        registry = await ImpactRegistry.deployed();
        linker = await Linker.new(registry.address, 10);
        await registry.setLinker(linker.address);

        (await linker.unit()).should.be.bignumber.equal(10);
        (await linker.registry()).should.be.equal(registry.address);
    });

    it("should link one donor, one unit impact", async function() {
        await registry.registerDonation(donor1, 10);
        await registry.registerOutcome("single10", 10);

        (await registry.getBalance(donor1)).should.be.bignumber.equal(10);
        (await registry.getImpactValue("single10", donor1)).should.be.bignumber.equal(0);

        await registry.linkImpact("single10");

        (await registry.getBalance(donor1)).should.be.bignumber.equal(0);
        (await registry.getImpactValue("single10", donor1)).should.be.bignumber.equal(10);
    });

    it("should link two donors, two units impact", async function() {
        await registry.registerDonation(donor1, 10);
        await registry.registerDonation(donor2, 10);
        await registry.registerOutcome("double20", 20);

        (await registry.getImpactValue("double20", donor1)).should.be.bignumber.equal(0);
        (await registry.getImpactValue("double20", donor2)).should.be.bignumber.equal(0);

        await registry.linkImpact("double20");
        await registry.linkImpact("double20");

        (await registry.getBalance(donor1)).should.be.bignumber.equal(0);
        (await registry.getImpactValue("double20", donor1)).should.be.bignumber.equal(10);
        (await registry.getImpactValue("double20", donor2)).should.be.bignumber.equal(10);
    });


});
