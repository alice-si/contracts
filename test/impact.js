var ImpactRegistry = artifacts.require("ImpactRegistry");
var Linker = artifacts.require("SmartImpactLinker");

const BigNumber = web3.BigNumber

const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should()

contract('Singe impactRegistry donation', function(accounts) {
  var donor1 = accounts[1];
  var registry, linker;

  it("should attach master contract", async function() {
      registry = await ImpactRegistry.deployed();
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
      registry = await ImpactRegistry.deployed();
      linker = await Linker.new(registry.address, 10);
      await registry.setLinker(linker.address);

      (await linker.unit()).should.be.bignumber.equal(10);
      (await linker.registry()).should.be.equal(registry.address);
  });


  it("should register impactRegistry from donor1", async function () {
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
      registry = await ImpactRegistry.deployed();
      linker = await Linker.new(registry.address, 10);
      await registry.setLinker(linker.address);

      (await linker.unit()).should.be.bignumber.equal(10);
      (await linker.registry()).should.be.equal(registry.address);
  });


  it("should register impactRegistry from donor1", async function () {
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


  it("should link impactRegistry in first step (10/13)", async function () {
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

    it("should link impactRegistry in first step (13/13)", async function () {
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
//
// contract('Two donations', function(accounts) {
//   var main = accounts[0];
//   var donor1 = accounts[1];
//   var donor2 = accounts[2];
//
//   it("should attach master contract", function(done) {
//     ImpactRegistry.deployed().then(function(instance) {
//       impactRegistry = instance;
//       return impactRegistry.setMasterContract(main, {from: main});
//     }).then(function() {
//       return impactRegistry.masterContract();
//     }).then(function(address) {
//       return assert.equal(address, main, "Master contract hasn't been set up correctly");
//     })
//       .then(done)
//       .catch(done);
//   });
//
//   it("should correctly set an unit of impact", function(done) {
//     impactRegistry.setUnit(10, {from: main}).then(function() {
//       return impactRegistry.unit.call();
//     }).then(function(unit) {
//       return assert.equal(unit, 10, "Unit for impact reconciliation hasn't been set up correctly");
//     })
//       .then(done)
//       .catch(done);
//   });
//
//   it("should register impactRegistry from donor1", function (done) {
//     impactRegistry.registerDonation(donor1, 15, {from: main}).then(function () {
//       return impactRegistry.getBalance.call(donor1, {from: main})
//     }).then(function (balance) {
//       return assert.equal(balance.valueOf(), 15, "15 wasn't in registry after donation");
//     })
//       .then(done)
//       .catch(done);
//   });
//
//   it("should register impactRegistry from donor2", function (done) {
//     impactRegistry.registerDonation(donor2, 20, {from: main}).then(function () {
//       return impactRegistry.getBalance.call(donor2, {from: main})
//     }).then(function (balance) {
//       return assert.equal(balance.valueOf(), 20, "20 wasn't in registry after donation");
//     })
//       .then(done)
//       .catch(done);
//   });
//
//   it("should register outcome", function (done) {
//     impactRegistry.registerOutcome("outcome", 30, {from: main}).then(function () {
//       return impactRegistry.getImpactCount.call("outcome", {from: main})
//     }).then(function (count) {
//       return assert.equal(count.valueOf(), 0, "Should be no impactRegistry before linking");
//     })
//       .then(done)
//       .catch(done);
//   });
//
//   it("1 step (10 from donor1)", function (done) {
//     impactRegistry.linkImpact("outcome", {from: main}).then(function () {
//         return impactRegistry.getImpactCount.call("outcome", {from: main})
//       }).then(function (count) {
//       assert.equal(count.valueOf(), 1, "Should have impactRegistry after linking");
//       return impactRegistry.getImpactLinked.call("outcome")
//     }).then(function (linked) {
//       assert.equal(linked.valueOf(), 10, "Should link unit value");
//       return impactRegistry.getImpactDonor.call("outcome", 0)
//     }).then(function (donor) {
//       assert.equal(donor, donor1, "Should set donor for impactRegistry");
//       return impactRegistry.getImpactValue.call("outcome", donor1)
//     }).then(function (val) {
//       assert.equal(val.valueOf(), 10, "Should set value for impactRegistry");
//       return impactRegistry.getBalance.call(donor1);
//     }).then(function (balance) {
//       assert.equal(balance.valueOf(), 5, "Should have some balance after first step");
//     })
//       .then(done)
//       .catch(done);
//   });
//
//
//   it("2 step (10 from donor2)", function (done) {
//     impactRegistry.linkImpact("outcome", {from: main}).then(function () {
//       return impactRegistry.getImpactCount.call("outcome", {from: main})
//     }).then(function (count) {
//       assert.equal(count.valueOf(), 2, "Should have impactRegistry after linking");
//       return impactRegistry.getImpactLinked.call("outcome")
//     }).then(function (linked) {
//       assert.equal(linked.valueOf(), 20, "Should link unit value");
//       return impactRegistry.getImpactDonor.call("outcome", 1)
//     }).then(function (donor) {
//       assert.equal(donor, donor2, "Should set donor for impactRegistry");
//       return impactRegistry.getImpactValue.call("outcome", donor2)
//     }).then(function (val) {
//       assert.equal(val.valueOf(), 10, "Should set value for impactRegistry");
//       return impactRegistry.getBalance.call(donor2);
//     }).then(function (balance) {
//       assert.equal(balance.valueOf(), 10, "Should have balance left for donor2");
//     })
//       .then(done)
//       .catch(done);
//   });
//
//   it("3 step (5 from donor1)", function (done) {
//     impactRegistry.linkImpact("outcome", {from: main}).then(function () {
//       return impactRegistry.getImpactCount.call("outcome", {from: main})
//     }).then(function (count) {
//       assert.equal(count.valueOf(), 2, "Should have impactRegistry after linking");
//       return impactRegistry.getImpactLinked.call("outcome")
//     }).then(function (linked) {
//       assert.equal(linked.valueOf(), 25, "Should link unit value");
//       return impactRegistry.getImpactDonor.call("outcome", 0)
//     }).then(function (donor) {
//       assert.equal(donor, donor1, "Should set donor for impactRegistry");
//       return impactRegistry.getImpactValue.call("outcome", donor1)
//     }).then(function (val) {
//       assert.equal(val.valueOf(), 15, "Should set value for impactRegistry");
//       return impactRegistry.getBalance.call(donor1);
//     }).then(function (balance) {
//       assert.equal(balance.valueOf(), 0, "Should have balance left for donor1");
//     })
//       .then(done)
//       .catch(done);
//   });
//
//   it("4 step (5 from donor2)", function (done) {
//     impactRegistry.linkImpact("outcome", {from: main}).then(function () {
//       return impactRegistry.getImpactCount.call("outcome", {from: main})
//     }).then(function (count) {
//       assert.equal(count.valueOf(), 2, "Should have impactRegistry after linking");
//       return impactRegistry.getImpactLinked.call("outcome")
//     }).then(function (linked) {
//       assert.equal(linked.valueOf(), 30, "Should link unit value");
//       return impactRegistry.getImpactDonor.call("outcome", 1)
//     }).then(function (donor) {
//       assert.equal(donor, donor2, "Should set donor for impactRegistry");
//       return impactRegistry.getImpactValue.call("outcome", donor2)
//     }).then(function (val) {
//       assert.equal(val.valueOf(), 15, "Should set value for impactRegistry");
//       return impactRegistry.getBalance.call(donor2);
//     }).then(function (balance) {
//       assert.equal(balance.valueOf(), 5, "Should have balance left for donor2");
//     })
//       .then(done)
//       .catch(done);
//   });
//
//
// });
//
// contract('Two donations: 25 + 25', function(accounts) {
//   var main = accounts[0];
//   var donor1 = accounts[1];
//   var donor2 = accounts[2];
//   var judge = accounts[3];
//
//   it("should attach master contract", function(done) {
//     ImpactRegistry.deployed().then(function(instance) {
//       impactRegistry = instance;
//       return impactRegistry.setMasterContract(main, {from: main});
//     }).then(function() {
//       return impactRegistry.masterContract();
//     }).then(function(address) {
//       return assert.equal(address, main, "Master contract hasn't been set up correctly");
//     })
//       .then(done)
//       .catch(done);
//   });
//
//   it("should correctly set an unit of impact", function(done) {
//     impactRegistry.setUnit(10, {from: main}).then(function() {
//       return impactRegistry.unit.call();
//     }).then(function(unit) {
//       return assert.equal(unit, 10, "Unit for impact reconciliation hasn't been set up correctly");
//     })
//       .then(done)
//       .catch(done);
//   });
//
//
//   it("should register impactRegistry from donor1", function (done) {
//     impactRegistry.registerDonation(donor1, 25, {from: main}).then(function () {
//       return impactRegistry.getBalance.call(donor1, {from: main})
//     }).then(function (balance) {
//       return assert.equal(balance.valueOf(), 25, "25 wasn't in registry after donation");
//     })
//       .then(done)
//       .catch(done);
//   });
//
//
//   it("should register impactRegistry from donor2", function (done) {
//     impactRegistry.registerDonation(donor2, 25, {from: main}).then(function () {
//       return impactRegistry.getBalance.call(donor2, {from: main})
//     }).then(function (balance) {
//       return assert.equal(balance.valueOf(), 25, "25 wasn't in registry after donation");
//     })
//       .then(done)
//       .catch(done);
//   });
//
//   it("should register outcome", function (done) {
//     impactRegistry.registerOutcome("outcome", 50, {from: main}).then(function () {
//       return impactRegistry.getImpactCount.call("outcome", {from: main})
//     }).then(function (count) {
//       return assert.equal(count.valueOf(), 0, "Should be no impactRegistry before linking");
//     })
//       .then(done)
//       .catch(done);
//   });
//
//   it("1 step (10 from donor1)", function (done) {
//     impactRegistry.linkImpact("outcome", {from: main}).then(function () {
//       return impactRegistry.getImpactCount.call("outcome", {from: main})
//     }).then(function (count) {
//       assert.equal(count.valueOf(), 1, "Should have impactRegistry after linking");
//       return impactRegistry.getImpactLinked.call("outcome")
//     }).then(function (linked) {
//       assert.equal(linked.valueOf(), 10, "Should link unit value");
//       return impactRegistry.getImpactDonor.call("outcome", 0)
//     }).then(function (donor) {
//       assert.equal(donor, donor1, "Should set donor for impactRegistry");
//       return impactRegistry.getImpactValue.call("outcome", donor1)
//     }).then(function (val) {
//       assert.equal(val.valueOf(), 10, "Should set value for impactRegistry");
//       return impactRegistry.getBalance.call(donor1);
//     }).then(function (balance) {
//       assert.equal(balance.valueOf(), 15, "Should have some balance after first step");
//     })
//       .then(done)
//       .catch(done);
//   });
//
//   it("2 step (10 from donor2)", function (done) {
//     impactRegistry.linkImpact("outcome", {from: main}).then(function () {
//         return impactRegistry.getImpactCount.call("outcome", {from: main})
//     }).then(function (count) {
//       assert.equal(count.valueOf(), 2, "Should have impactRegistry after linking");
//       return impactRegistry.getImpactLinked.call("outcome")
//     }).then(function (linked) {
//       assert.equal(linked.valueOf(), 20, "Should link unit value");
//       return impactRegistry.getImpactDonor.call("outcome", 1)
//     }).then(function (donor) {
//       assert.equal(donor, donor2, "Should set donor for impactRegistry");
//       return impactRegistry.getImpactValue.call("outcome", donor2)
//     }).then(function (val) {
//       assert.equal(val.valueOf(), 10, "Should set value for impactRegistry");
//       return impactRegistry.getBalance.call(donor2);
//     }).then(function (balance) {
//       assert.equal(balance.valueOf(), 15, "Should have balance left for donor2");
//     })
//       .then(done)
//       .catch(done);
//   });
//
//   it("3 step (10 from donor1)", function (done) {
//     impactRegistry.linkImpact("outcome", {from: main}).then(function () {
//       return impactRegistry.getImpactCount.call("outcome", {from: main})
//     }).then(function (count) {
//       assert.equal(count.valueOf(), 2, "Should have impactRegistry after linking");
//       return impactRegistry.getImpactLinked.call("outcome")
//     }).then(function (linked) {
//       assert.equal(linked.valueOf(), 30, "Should link unit value");
//       return impactRegistry.getImpactDonor.call("outcome", 0)
//     }).then(function (donor) {
//       assert.equal(donor, donor1, "Should set donor for impactRegistry");
//       return impactRegistry.getImpactValue.call("outcome", donor1)
//     }).then(function (val) {
//       assert.equal(val.valueOf(), 20, "Should set value for impactRegistry");
//       return impactRegistry.getBalance.call(donor1);
//     }).then(function (balance) {
//       assert.equal(balance.valueOf(), 5, "Should have balance left for donor1");
//     })
//       .then(done)
//       .catch(done);
//   });
//
//   it("4 step (10 from donor2)", function (done) {
//     impactRegistry.linkImpact("outcome", {from: main}).then(function () {
//       return impactRegistry.getImpactCount.call("outcome", {from: main})
//     }).then(function (count) {
//       assert.equal(count.valueOf(), 2, "Should have impactRegistry after linking");
//       return impactRegistry.getImpactLinked.call("outcome")
//     }).then(function (linked) {
//       assert.equal(linked.valueOf(), 40, "Should link unit value");
//       return impactRegistry.getImpactDonor.call("outcome", 1)
//     }).then(function (donor) {
//       assert.equal(donor, donor2, "Should set donor for impactRegistry");
//       return impactRegistry.getImpactValue.call("outcome", donor2)
//     }).then(function (val) {
//       assert.equal(val.valueOf(), 20, "Should set value for impactRegistry");
//       return impactRegistry.getBalance.call(donor2);
//     }).then(function (balance) {
//       assert.equal(balance.valueOf(), 5, "Should have balance left for donor2");
//     })
//       .then(done)
//       .catch(done);
//   });
//
//   it("5 step (5 from donor1)", function (done) {
//     impactRegistry.linkImpact("outcome", {from: main}).then(function () {
//       return impactRegistry.getImpactCount.call("outcome", {from: main})
//     }).then(function (count) {
//       assert.equal(count.valueOf(), 2, "Should have impactRegistry after linking");
//       return impactRegistry.getImpactLinked.call("outcome")
//     }).then(function (linked) {
//       assert.equal(linked.valueOf(), 45, "Should link unit value");
//       return impactRegistry.getImpactDonor.call("outcome", 0)
//     }).then(function (donor) {
//       assert.equal(donor, donor1, "Should set donor for impactRegistry");
//       return impactRegistry.getImpactValue.call("outcome", donor1)
//     }).then(function (val) {
//       assert.equal(val.valueOf(), 25, "Should set value for impactRegistry");
//       return impactRegistry.getBalance.call(donor1);
//     }).then(function (balance) {
//       assert.equal(balance.valueOf(), 0, "Should have balance left for donor1");
//     })
//       .then(done)
//       .catch(done);
//   });
//
//   it("6 step (5 from donor2)", function (done) {
//     impactRegistry.linkImpact("outcome", {from: main}).then(function () {
//       return impactRegistry.getImpactCount.call("outcome", {from: main})
//     }).then(function (count) {
//       assert.equal(count.valueOf(), 2, "Should have impactRegistry after linking");
//       return impactRegistry.getImpactLinked.call("outcome")
//     }).then(function (linked) {
//       assert.equal(linked.valueOf(), 50, "Should link unit value");
//       return impactRegistry.getImpactDonor.call("outcome", 1)
//     }).then(function (donor) {
//       assert.equal(donor, donor2, "Should set donor for impactRegistry");
//       return impactRegistry.getImpactValue.call("outcome", donor2)
//     }).then(function (val) {
//       assert.equal(val.valueOf(), 25, "Should set value for impactRegistry");
//       return impactRegistry.getBalance.call(donor2);
//     }).then(function (balance) {
//       assert.equal(balance.valueOf(), 0, "Should have balance left for donor2");
//     })
//       .then(done)
//       .catch(done);
//   });
//
// });
