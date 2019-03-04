var Project = artifacts.require('Project');
var ProjectCatalog = artifacts.require('ProjectCatalog');
var DonationWallet = artifacts.require('DonationWallet');
var AliceToken = artifacts.require('AliceToken');
var ImpactRegistry = artifacts.require('ImpactRegistry');
var ClaimsRegistry = artifacts.require('ClaimsRegistry');
var Linker = artifacts.require('FlexibleImpactLinker');

require('../test-setup');

contract('Project with ClaimsRegistry scenario', ([owner, beneficiary, validator]) => {
  let project;
  let catalog;
  let wallet;
  let token;
  let impactRegistry;
  let linker;
  let claimsRegistry;


  step('contracts are deployed', async () => {
    project = await Project.new('TEST', 0);
    impactRegistry = await ImpactRegistry.new(project.address);
    claimsRegistry = await ClaimsRegistry.new();
    linker = await Linker.new(impactRegistry.address, 10);
    token = await AliceToken.deployed();

    await impactRegistry.setLinker(linker.address);
    await project.setImpactRegistry(impactRegistry.address);
    await project.setBeneficiary(beneficiary);
    await project.setValidator(validator);
    await project.setClaimsRegistry(claimsRegistry.address);
    await project.setToken(token.address);

    catalog = await ProjectCatalog.new();
    await catalog.addProject('TEST', project.address);
  });


  step('donation is made', async () => {
    wallet = await DonationWallet.new(catalog.address);
    await token.mint(wallet.address, 1000);
    await wallet.donate(1000, "TEST");
    (await token.balanceOf(wallet.address)).should.be.bignumber.equal(0);
  });


  step('beneficiary claims an outcome', async () => {
    let value = '0x' + web3.padLeft(web3.toHex(100).substr(2), 64);
    await claimsRegistry.setClaim(project.address, 'OUTCOME', value, {from: beneficiary});
  });


  step('validator approves the claim, funds are transferred to beneficiary', async () => {
    await project.validateOutcome('OUTCOME', 100, {from: validator});
    (await token.balanceOf(beneficiary)).should.be.bignumber.equal(100);
    (await token.balanceOf(project.address)).should.be.bignumber.equal(900);
  });


  step('validator cannot approve the same claim the second time', async () => {
    await project.validateOutcome('OUTCOME', 100, {from: validator}).shouldBeReverted();
  });


  step('funds are linked', async () => {
    (await project.getBalance(wallet.address)).should.be.bignumber.equal(1000);
    for (let i = 0; i < 10; i++) await impactRegistry.linkImpact('OUTCOME');
    (await project.getBalance(wallet.address)).should.be.bignumber.equal(900);
  });
});
