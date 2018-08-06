var Privileged     = artifacts.require("Privileged");

require("./helper").prepare();

contract('Singe impactRegistry donation', function(accounts) {
	var owner = accounts[0];
	var controller = accounts[1];
	var owner2 = accounts[2];
	var privileged;

	beforeEach("deploy Privileged contract", async function() {
		privileged = await Privileged.new();
	});

	it("should create privilege", async function() {
		await privileged.createPrivilege("owner", owner, owner);
	});

	it("shouldn't allow creating the same privilege", async function() {
		await privileged.createPrivilege("owner", owner, owner);
		await privileged.createPrivilege("owner", owner, owner).shouldBeReverted();
	});

	it("should transfer ownership as controller", async function() {
		await privileged.createPrivilege("owner", owner, controller);
		await privileged.transferPrivilege("owner", owner2, {from: controller});
	});

	it("shouldn't allow transferring ownership as owner", async function() {
		await privileged.createPrivilege("owner", owner, controller);
		await privileged.transferPrivilege("owner", owner2, {from: owner}).shouldBeReverted();
	});

	it("should revoke and recreate a privilege", async function() {
		await privileged.createPrivilege("owner", owner, controller);
		await privileged.revokePrivilege("owner", {from: controller});
		await privileged.createPrivilege("owner", owner, controller);
	});

	it("shouldn't allow revoking if it's not a controller", async function() {
		await privileged.createPrivilege("owner", owner, controller);
		await privileged.revokePrivilege("owner", {from: owner}).shouldBeReverted();
	});



});
