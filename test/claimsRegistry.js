const ClaimsRegistry = artifacts.require('ClaimsRegistry');

require('./test-setup');

contract('ClaimsRegistry', ([main, issuer, validator, subject]) => {
  let claimsRegistry;

  beforeEach(async () => {
    claimsRegistry = await ClaimsRegistry.new();
  });


  it('should not return claims from an empty registry', async () => {
    (await claimsRegistry.getClaim(issuer, subject, 'KEY_1')).should.be.bignumber.equal(0);
  });


  it('should save added claims', async () => {
    await claimsRegistry.setClaim(subject, 'KEY_1', 'CLAIM', {from: issuer});
    web3.toUtf8((await claimsRegistry.getClaim(issuer, subject, 'KEY_1'))).should.be.equal('CLAIM');
  });


  it('should not keep removed claims', async () => {
    await claimsRegistry.setClaim(subject, 'KEY_1', 'CLAIM', {from: issuer});
    await claimsRegistry.removeClaim(subject, 'KEY_1', {from: issuer});
    (await claimsRegistry.getClaim(issuer, subject, 'KEY_1')).should.be.bignumber.equal(0);
  });


  it('should not consider new claims approved', async () => {
    await claimsRegistry.setClaim(subject, 'KEY_1', 'CLAIM', {from: issuer});
    (await claimsRegistry.isApproved(validator, issuer, subject, 'KEY_1')).should.be.false;
  });


  it('should save approvals', async () => {
    await claimsRegistry.setClaim(subject, 'KEY_1', 'CLAIM', {from: issuer});
    await claimsRegistry.approveClaim(issuer, subject, 'KEY_1', {from: validator});
    (await claimsRegistry.isApproved(validator, issuer, subject, 'KEY_1')).should.be.true;
  });


  it('should no longer consider changed claims approved', async () => {
    await claimsRegistry.setClaim(subject, 'KEY_1', 'CLAIM', {from: issuer});
    await claimsRegistry.approveClaim(issuer, subject, 'KEY_1', {from: validator});
    await claimsRegistry.setClaim(subject, 'KEY_1', 'CLAIM_UPDATED', {from: issuer});
    (await claimsRegistry.isApproved(validator, issuer, subject, 'KEY_1')).should.be.false;
  });
});
