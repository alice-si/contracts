var Project = artifacts.require("Project");
var SimpleContractRegistry = artifacts.require("SimpleContractRegistry");
var ImpactRegistry = artifacts.require("ImpactRegistry");
var Linker = artifacts.require("OffChainImpactLinker");

require("./helper").testSetup();

contract('Off-Chain Impact Linker', function(accounts) {
	var donor1 = accounts[1];
	var donor2 = accounts[2];
	var registry, linker;

	it("should attach and configure linker", async function() {
		registry = await ImpactRegistry.new(Project.address);

		linker = await Linker.new(registry.address);

		await registry.setLinker(linker.address);
		(await linker.registry()).should.be.equal(registry.address);
	});

	it("should link one donor, one unit impact", async function() {
		await registry.registerDonation(donor1, 10);
		await registry.registerOutcome("single10", 10);

		(await registry.getBalance(donor1)).should.be.bignumber.equal(10);
		(await registry.getImpactValue("single10", donor1)).should.be.bignumber.equal(0);

		await linker.linkDirectly("single10", 0, 10);

		(await registry.getBalance(donor1)).should.be.bignumber.equal(0);
		(await registry.getImpactValue("single10", donor1)).should.be.bignumber.equal(10);
	});

});
