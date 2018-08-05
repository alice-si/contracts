var ImpactRegistry = artifacts.require("ImpactRegistry");
var Linker = artifacts.require("FlexibleImpactLinker");
var Project = artifacts.require("Project");

const BigNumber = web3.BigNumber

const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should()

contract('Single impactRegistry donation', function(accounts) {
  var donor1 = accounts[1];
  var registry, linker;

  it("should attach master contract", async function() {
      registry = await ImpactRegistry.new(Project.address);
      linker = await Linker.new(registry.address, 10);
      await registry.setLinker(linker.address);

      (await linker.unit()).should.be.bignumber.equal(10);
      (await linker.registry()).should.be.equal(registry.address);
  });

  it("should register donation from donor1", async function () {
    await registry.registerDonation(donor1, 10);

    var balance = await registry.getBalance(donor1);

    balance.should.be.bignumber.equal(10);
  });

  it("should register outcome", async function () {
    await registry.registerOutcome("single10", 10);

    //Global for impact
    (await registry.getImpactCount("single10")).should.be.bignumber.equal(0);
    (await registry.getImpactTotalValue("single10")).should.be.bignumber.equal(10);
    (await registry.getImpactLinked("single10")).should.be.bignumber.equal(0);

    //Per donor
    (await registry.getImpactValue("single10", donor1)).should.be.bignumber.equal(0);
  });


  it("should link impactRegistry", async function () {
      await registry.linkImpact("single10");

      //Global for impact
      (await registry.getImpactCount("single10")).should.be.bignumber.equal(1);
      (await registry.getImpactTotalValue("single10")).should.be.bignumber.equal(10);
      (await registry.getImpactLinked("single10")).should.be.bignumber.equal(10);

      //Per donor
      (await registry.getBalance(donor1)).should.be.bignumber.equal(0);
      (await registry.getImpactDonor("single10", 0)).should.be.equal(donor1);
      (await registry.getImpactValue("single10", donor1)).should.be.bignumber.equal(10);
  });

});

contract('Donation below unit', function(accounts) {
  var donor1 = accounts[1];
  var registry, linker;

  it("should configure impact registry", async function() {
		  registry = await ImpactRegistry.new(Project.address);
      linker = await Linker.new(registry.address, 10);
      await registry.setLinker(linker.address);

      (await linker.unit()).should.be.bignumber.equal(10);
      (await linker.registry()).should.be.equal(registry.address);
  });


  it("should register donation from donor1", async function () {
      await registry.registerDonation(donor1, 7);

      var balance = await registry.getBalance(donor1);

      balance.should.be.bignumber.equal(7);
  });


  it("should register outcome", async function () {
      await registry.registerOutcome("single7", 7);

      //Global for impact
      (await registry.getImpactCount("single7")).should.be.bignumber.equal(0);
      (await registry.getImpactTotalValue("single7")).should.be.bignumber.equal(7);
      (await registry.getImpactLinked("single7")).should.be.bignumber.equal(0);

      //Per donor
      (await registry.getImpactValue("single7", donor1)).should.be.bignumber.equal(0);
  });

  it("should link impactRegistry", async function () {
      await registry.linkImpact("single7");

      //Global for impact
      (await registry.getImpactCount("single7")).should.be.bignumber.equal(1);
      (await registry.getImpactTotalValue("single7")).should.be.bignumber.equal(7);
      (await registry.getImpactLinked("single7")).should.be.bignumber.equal(7);

      //Per donor
      (await registry.getBalance(donor1)).should.be.bignumber.equal(0);
      (await registry.getImpactDonor("single7", 0)).should.be.equal(donor1);
      (await registry.getImpactValue("single7", donor1)).should.be.bignumber.equal(7);
  });


});

contract('Donation above unit', function(accounts) {
  var donor1 = accounts[1];
  var registry, linker;

  it("should configure impact registry", async function() {
		  registry = await ImpactRegistry.new(Project.address);
      linker = await Linker.new(registry.address, 10);
      await registry.setLinker(linker.address);

      (await linker.unit()).should.be.bignumber.equal(10);
      (await linker.registry()).should.be.equal(registry.address);
  });


  it("should register donation from donor1", async function () {
      await registry.registerDonation(donor1, 13);

      var balance = await registry.getBalance(donor1);

      balance.should.be.bignumber.equal(13);
  });

  it("should register outcome", async function () {
      await registry.registerOutcome("single13", 13);

      //Global for impact
      (await registry.getImpactCount("single13")).should.be.bignumber.equal(0);
      (await registry.getImpactTotalValue("single13")).should.be.bignumber.equal(13);
      (await registry.getImpactLinked("single13")).should.be.bignumber.equal(0);

      //Per donor
      (await registry.getImpactValue("single13", donor1)).should.be.bignumber.equal(0);
  });


  it("should link impactRegistry in 1/2 step (10/13)", async function () {
      await registry.linkImpact("single13");

      //Global for impact
      (await registry.getImpactCount("single13")).should.be.bignumber.equal(1);
      (await registry.getImpactTotalValue("single13")).should.be.bignumber.equal(13);
      (await registry.getImpactLinked("single13")).should.be.bignumber.equal(10);

      //Per donor
      (await registry.getBalance(donor1)).should.be.bignumber.equal(3);
      (await registry.getImpactDonor("single13", 0)).should.be.equal(donor1);
      (await registry.getImpactValue("single13", donor1)).should.be.bignumber.equal(10);
  });

  it("should link impactRegistry in 2/2 step (13/13)", async function () {
    await registry.linkImpact("single13");

    //Global for impact
    (await registry.getImpactCount("single13")).should.be.bignumber.equal(1);
    (await registry.getImpactTotalValue("single13")).should.be.bignumber.equal(13);
    (await registry.getImpactLinked("single13")).should.be.bignumber.equal(13);

    //Per donor
    (await registry.getBalance(donor1)).should.be.bignumber.equal(0);
    (await registry.getImpactDonor("single13", 0)).should.be.equal(donor1);
    (await registry.getImpactValue("single13", donor1)).should.be.bignumber.equal(13);
  });
});

contract('Two donations (15+20)', function(accounts) {
  var donor1 = accounts[1];
  var donor2 = accounts[2];
  var registry, linker;

  it("should configure impact registry", async function() {
		registry = await ImpactRegistry.new(Project.address);
    linker = await Linker.new(registry.address, 10);
    await registry.setLinker(linker.address);

    (await linker.unit()).should.be.bignumber.equal(10);
    (await linker.registry()).should.be.equal(registry.address);
  });

  it("should register donation(15) from donor1", async function () {
      await registry.registerDonation(donor1, 15);

      var balance = await registry.getBalance(donor1);

      balance.should.be.bignumber.equal(15);
  });

  it("should register donation(20) from donor2", async function () {
      await registry.registerDonation(donor2, 20);

      var balance = await registry.getBalance(donor2);

      balance.should.be.bignumber.equal(20);
  });

  it("should register outcome", async function () {
    await registry.registerOutcome("double35", 35);

    //Global for impact
    (await registry.getImpactCount("double35")).should.be.bignumber.equal(0);
    (await registry.getImpactTotalValue("double35")).should.be.bignumber.equal(35);
    (await registry.getImpactLinked("double35")).should.be.bignumber.equal(0);

    //Per donor
    (await registry.getImpactValue("double35", donor1)).should.be.bignumber.equal(0);
    (await registry.getImpactValue("double35", donor2)).should.be.bignumber.equal(0);
  });

  it("should link impactRegistry in 1/4 step (10/35)", async function () {
    await registry.linkImpact("double35");

    //Global for impact
    (await registry.getImpactCount("double35")).should.be.bignumber.equal(1);
    (await registry.getImpactTotalValue("double35")).should.be.bignumber.equal(35);
    (await registry.getImpactLinked("double35")).should.be.bignumber.equal(10);

    //Per donor1
    (await registry.getBalance(donor1)).should.be.bignumber.equal(5);
    (await registry.getImpactDonor("double35", 0)).should.be.equal(donor1);
    (await registry.getImpactValue("double35", donor1)).should.be.bignumber.equal(10);

		//Per donor2
		(await registry.getBalance(donor2)).should.be.bignumber.equal(20);
		(await registry.getImpactValue("double35", donor2)).should.be.bignumber.equal(0);
  });

	it("should link impactRegistry in 2/4 step (20/35)", async function () {
		await registry.linkImpact("double35");

		//Global for impact
		(await registry.getImpactCount("double35")).should.be.bignumber.equal(2);
		(await registry.getImpactTotalValue("double35")).should.be.bignumber.equal(35);
		(await registry.getImpactLinked("double35")).should.be.bignumber.equal(20);

		//Per donor1
		(await registry.getBalance(donor1)).should.be.bignumber.equal(5);
		(await registry.getImpactDonor("double35", 0)).should.be.equal(donor1);
		(await registry.getImpactValue("double35", donor1)).should.be.bignumber.equal(10);

		//Per donor2
		(await registry.getBalance(donor2)).should.be.bignumber.equal(10);
		(await registry.getImpactDonor("double35", 1)).should.be.equal(donor2);
		(await registry.getImpactValue("double35", donor2)).should.be.bignumber.equal(10);
	});

	it("should link impactRegistry in 3/4 step (25/35)", async function () {
		await registry.linkImpact("double35");

		//Global for impact
		(await registry.getImpactCount("double35")).should.be.bignumber.equal(2);
		(await registry.getImpactTotalValue("double35")).should.be.bignumber.equal(35);
		(await registry.getImpactLinked("double35")).should.be.bignumber.equal(25);

		//Per donor1
		(await registry.getBalance(donor1)).should.be.bignumber.equal(0);
		(await registry.getImpactDonor("double35", 0)).should.be.equal(donor1);
		(await registry.getImpactValue("double35", donor1)).should.be.bignumber.equal(15);

		//Per donor2
		(await registry.getBalance(donor2)).should.be.bignumber.equal(10);
		(await registry.getImpactDonor("double35", 1)).should.be.equal(donor2);
		(await registry.getImpactValue("double35", donor2)).should.be.bignumber.equal(10);
	});

	it("should link impactRegistry in 4/4 step (35/35)", async function () {
		await registry.linkImpact("double35");

		//Global for impact
		(await registry.getImpactCount("double35")).should.be.bignumber.equal(2);
		(await registry.getImpactTotalValue("double35")).should.be.bignumber.equal(35);
		(await registry.getImpactLinked("double35")).should.be.bignumber.equal(35);

		//Per donor1
		(await registry.getBalance(donor1)).should.be.bignumber.equal(0);
		(await registry.getImpactDonor("double35", 0)).should.be.equal(donor1);
		(await registry.getImpactValue("double35", donor1)).should.be.bignumber.equal(15);

		//Per donor2
		(await registry.getBalance(donor2)).should.be.bignumber.equal(0);
		(await registry.getImpactDonor("double35", 1)).should.be.equal(donor2);
		(await registry.getImpactValue("double35", donor2)).should.be.bignumber.equal(20);
	});
});

contract('Two donations (25+25)', function(accounts) {
	var donor1 = accounts[1];
	var donor2 = accounts[2];
	var registry, linker;

	it("should configure impact registry", async function() {
		registry = await ImpactRegistry.new(Project.address);
		linker = await Linker.new(registry.address, 10);
		await registry.setLinker(linker.address);

		(await linker.unit()).should.be.bignumber.equal(10);
		(await linker.registry()).should.be.equal(registry.address);
	});

	it("should register donation(25) from donor1", async function () {
		await registry.registerDonation(donor1, 25);

		var balance = await registry.getBalance(donor1);

		balance.should.be.bignumber.equal(25);
	});

	it("should register donation(25) from donor2", async function () {
		await registry.registerDonation(donor2, 25);

		var balance = await registry.getBalance(donor2);

		balance.should.be.bignumber.equal(25);
	});

	it("should register outcome", async function () {
		await registry.registerOutcome("double50", 50);

		//Global for impact
		(await registry.getImpactCount("double50")).should.be.bignumber.equal(0);
		(await registry.getImpactTotalValue("double50")).should.be.bignumber.equal(50);
		(await registry.getImpactLinked("double50")).should.be.bignumber.equal(0);

		//Per donor
		(await registry.getImpactValue("double50", donor1)).should.be.bignumber.equal(0);
		(await registry.getImpactValue("double50", donor2)).should.be.bignumber.equal(0);
	});

	it("should link impactRegistry in 1/6 step (10/50)", async function () {
		await registry.linkImpact("double50");

		//Global for impact
		(await registry.getImpactCount("double50")).should.be.bignumber.equal(1);
		(await registry.getImpactTotalValue("double50")).should.be.bignumber.equal(50);
		(await registry.getImpactLinked("double50")).should.be.bignumber.equal(10);

		//Per donor1
		(await registry.getBalance(donor1)).should.be.bignumber.equal(15);
		(await registry.getImpactDonor("double50", 0)).should.be.equal(donor1);
		(await registry.getImpactValue("double50", donor1)).should.be.bignumber.equal(10);

		//Per donor2
		(await registry.getBalance(donor2)).should.be.bignumber.equal(25);
		(await registry.getImpactValue("double50", donor2)).should.be.bignumber.equal(0);
	});

	it("should link impactRegistry in 2/6 step (20/50)", async function () {
		await registry.linkImpact("double50");

		//Global for impact
		(await registry.getImpactCount("double50")).should.be.bignumber.equal(2);
		(await registry.getImpactTotalValue("double50")).should.be.bignumber.equal(50);
		(await registry.getImpactLinked("double50")).should.be.bignumber.equal(20);

		//Per donor1
		(await registry.getBalance(donor1)).should.be.bignumber.equal(15);
		(await registry.getImpactDonor("double50", 0)).should.be.equal(donor1);
		(await registry.getImpactValue("double50", donor1)).should.be.bignumber.equal(10);

		//Per donor2
		(await registry.getBalance(donor2)).should.be.bignumber.equal(15);
		(await registry.getImpactDonor("double50", 1)).should.be.equal(donor2);
		(await registry.getImpactValue("double50", donor2)).should.be.bignumber.equal(10);
	});

	it("should link impactRegistry in 3/6 step (30/50)", async function () {
		await registry.linkImpact("double50");

		//Global for impact
		(await registry.getImpactCount("double50")).should.be.bignumber.equal(2);
		(await registry.getImpactTotalValue("double50")).should.be.bignumber.equal(50);
		(await registry.getImpactLinked("double50")).should.be.bignumber.equal(30);

		//Per donor1
		(await registry.getBalance(donor1)).should.be.bignumber.equal(5);
		(await registry.getImpactDonor("double50", 0)).should.be.equal(donor1);
		(await registry.getImpactValue("double50", donor1)).should.be.bignumber.equal(20);

		//Per donor2
		(await registry.getBalance(donor2)).should.be.bignumber.equal(15);
		(await registry.getImpactDonor("double50", 1)).should.be.equal(donor2);
		(await registry.getImpactValue("double50", donor2)).should.be.bignumber.equal(10);
	});

	it("should link impactRegistry in 4/6 step (40/50)", async function () {
		await registry.linkImpact("double50");

		//Global for impact
		(await registry.getImpactCount("double50")).should.be.bignumber.equal(2);
		(await registry.getImpactTotalValue("double50")).should.be.bignumber.equal(50);
		(await registry.getImpactLinked("double50")).should.be.bignumber.equal(40);

		//Per donor1
		(await registry.getBalance(donor1)).should.be.bignumber.equal(5);
		(await registry.getImpactDonor("double50", 0)).should.be.equal(donor1);
		(await registry.getImpactValue("double50", donor1)).should.be.bignumber.equal(20);

		//Per donor2
		(await registry.getBalance(donor2)).should.be.bignumber.equal(5);
		(await registry.getImpactDonor("double50", 1)).should.be.equal(donor2);
		(await registry.getImpactValue("double50", donor2)).should.be.bignumber.equal(20);
	});

	it("should link impactRegistry in 5/6 step (45/50)", async function () {
		await registry.linkImpact("double50");

		//Global for impact
		(await registry.getImpactCount("double50")).should.be.bignumber.equal(2);
		(await registry.getImpactTotalValue("double50")).should.be.bignumber.equal(50);
		(await registry.getImpactLinked("double50")).should.be.bignumber.equal(45);

		//Per donor1
		(await registry.getBalance(donor1)).should.be.bignumber.equal(0);
		(await registry.getImpactDonor("double50", 0)).should.be.equal(donor1);
		(await registry.getImpactValue("double50", donor1)).should.be.bignumber.equal(25);

		//Per donor2
		(await registry.getBalance(donor2)).should.be.bignumber.equal(5);
		(await registry.getImpactDonor("double50", 1)).should.be.equal(donor2);
		(await registry.getImpactValue("double50", donor2)).should.be.bignumber.equal(20);
	});

	it("should link impactRegistry in 6/6 step (50/50)", async function () {
		await registry.linkImpact("double50");

		//Global for impact
		(await registry.getImpactCount("double50")).should.be.bignumber.equal(2);
		(await registry.getImpactTotalValue("double50")).should.be.bignumber.equal(50);
		(await registry.getImpactLinked("double50")).should.be.bignumber.equal(50);

		//Per donor1
		(await registry.getBalance(donor1)).should.be.bignumber.equal(0);
		(await registry.getImpactDonor("double50", 0)).should.be.equal(donor1);
		(await registry.getImpactValue("double50", donor1)).should.be.bignumber.equal(25);

		//Per donor2
		(await registry.getBalance(donor2)).should.be.bignumber.equal(0);
		(await registry.getImpactDonor("double50", 1)).should.be.equal(donor2);
		(await registry.getImpactValue("double50", donor2)).should.be.bignumber.equal(25);
	});


});
