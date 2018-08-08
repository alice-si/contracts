var ProjectCatalog = artifacts.require("ProjectCatalog");
var Project = artifacts.require("Project");

require("./helper").testSetup();

contract('ProjectCatalog', function(accounts) {
	var owner = accounts[0];
	var project;
	var projectCatalog;

	before("deploy Privileged contract", async function() {
		projectCatalog = await ProjectCatalog.new();
	});

	it("should add a project to catalog", async function() {
		project = await Project.deployed();
		await projectCatalog.addProject("PROJECT", project.address);

		(await projectCatalog.getProjectAddress("PROJECT")).should.be.equal(project.address);
	});

	it("should prevent adding the same project again", async function() {
		await projectCatalog.addProject("PROJECT", project.address).shouldBeReverted();
	});

});
