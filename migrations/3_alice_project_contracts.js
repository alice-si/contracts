var Project = artifacts.require("Project");
var ProjectCatalog = artifacts.require("ProjectCatalog");
var ImpactRegistry = artifacts.require("ImpactRegistry");

module.exports = async function(deployer, network, accounts) {
  var validatorAccount = accounts[1];
  var beneficiaryAccount = accounts[2];
  var unit = 10;

  //Deploy Project
  await deployer.deploy(Project, "London Homeless", 0);
  let project = await Project.deployed();

  //Setup Impact Registry
  await deployer.deploy(ImpactRegistry, Project.address);
	let impactRegistry = await ImpactRegistry.deployed();
	console.log("Impact Registry deployed to: " + ImpactRegistry.address);

	//Configure project
	await project.setImpactRegistry(ImpactRegistry.address);
	await project.setValidator(validatorAccount);
	await project.setBeneficiary(beneficiaryAccount);

	//Register project in catalog
	await deployer.deploy(ProjectCatalog);
	let projectCatalog = await ProjectCatalog.deployed();
	await projectCatalog.addProject("project", Project.address);
};
