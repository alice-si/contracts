var Project = artifacts.require("Project");
var ProjectCatalog = artifacts.require("ProjectCatalog");
var DonationWallet = artifacts.require("DonationWallet");
var AliceToken = artifacts.require("AliceToken");
var ImpactRegistry = artifacts.require("ImpactRegistry");

require("./test-setup");

contract('DonationWallet', function(accounts) {
	var token, wallet, project;
	var projectCatalog;
	var donor = accounts[0];

	before("register project in catalog", async function () {
		project = await Project.new("Test project");
		var registry = await ImpactRegistry.new(project.address);
		await project.setImpactRegistry(registry.address);
		projectCatalog = await ProjectCatalog.new();
		await projectCatalog.addProject("PROJECT", project.address);
		wallet = await DonationWallet.new(projectCatalog.address);
	});

	it("should deposit tokens to donation wallet", async function() {
		token = await AliceToken.deployed();
		await project.setToken(token.address);

	  await token.mint(wallet.address, 100);

	  (await wallet.balance(token.address)).should.be.bignumber.equal(100);
	});

	it("should refund outstanding tokens", async function() {
		await wallet.refund(token.address, 50);

		(await wallet.balance(token.address)).should.be.bignumber.equal(50);
		(await token.balanceOf(donor)).should.be.bignumber.equal(50);
		(await token.balanceOf(wallet.address)).should.be.bignumber.equal(50);
	});

	it("should donate from wallet", async function() {
		await wallet.donate(10, "PROJECT");

		var projectAddress = await projectCatalog.getProjectAddress("PROJECT");
		var project = Project.at(projectAddress);
		(await wallet.balance(token.address)).should.be.bignumber.equal(40);
		(await project.getBalance(wallet.address)).should.be.bignumber.equal(10);
	});



});
