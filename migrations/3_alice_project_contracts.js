var Project = artifacts.require("Project");
var ProjectCatalog = artifacts.require("ProjectCatalog");
var ImpactRegistry = artifacts.require("ImpactRegistry");
var SimpleContractRegistry = artifacts.require("SimpleContractRegistry");

module.exports = async function(deployer, network, accounts) {
  var judgeAccount = accounts[1];
  var beneficiaryAccount = accounts[2];
  var unit = 10;

  //Deploy Project
  await deployer.deploy(Project, "London Homeless");
  let project = await Project.deployed();

  //Setup Impact Registry
  await deployer.deploy(ImpactRegistry, Project.address, 1000);
	let impactRegistry = await ImpactRegistry.deployed();
	await impactRegistry.setUnit(unit);

	//Configure project
	await project.setImpactRegistry(ImpactRegistry.address);
	await project.setJudge(judgeAccount);
	await project.setBeneficiary(beneficiaryAccount);
	await project.setContractProvider(SimpleContractRegistry.address);

	//Register project in catalog
	await deployer.deploy(ProjectCatalog);
	let projectCatalog = await ProjectCatalog.deployed();
	await projectCatalog.addProject("project", Project.address);
};