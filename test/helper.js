module.exports = {
  prepare: function () {
    const BigNumber = web3.BigNumber;
    require('chai')
      .use(require('chai-as-promised'))
      .use(require('chai-bignumber')(BigNumber))
      .should();

    Promise.prototype.shouldBeReverted = async function () {
      await this.should.be.rejectedWith('VM Exception while processing transaction: revert');
    };
  }
};