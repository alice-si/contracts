var ClaimsRegistry = artifacts.require("ClaimsRegistry");

require("./test-setup");

contract('Claims registry', function([main, issuer, validator, subject]) {
  var claimsRegistry;

  before("deploy Claim Registry", async function() {
    claimsRegistry = await ClaimsRegistry.new();
  });


  it("should not return claims from an empty registry", async function() {
    (await claimsRegistry.getClaim(issuer, subject, 'KEY_1')).should.be.bignumber.equal(0);
  });


  it("should add a claim", async function() {
    await claimsRegistry.setClaim(subject, 'KEY_1', 'CLAIM', {from: issuer});
    web3.toUtf8((await claimsRegistry.getClaim(issuer, subject, 'KEY_1'))).should.be.equal('CLAIM');
  });


  it("should not report approval before making one", async function() {
    (await claimsRegistry.isApproved(validator, issuer, subject, 'KEY_1')).should.be.false;
  });


  it("should approve a claim", async function() {
    await claimsRegistry.approveClaim(issuer, subject, 'KEY_1', {from: validator});
    (await claimsRegistry.isApproved(validator, issuer, subject, 'KEY_1')).should.be.true;
  });


  it("a changed claim should not longer be approved", async function() {
    await claimsRegistry.setClaim(subject, 'KEY_1', 'CLAIM_UPDATED', {from: issuer});
    (await claimsRegistry.isApproved(validator, issuer, subject, 'KEY_1')).should.be.false;
  });


});
