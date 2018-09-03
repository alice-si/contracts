const DigitalGBPToken = artifacts.require("DigitalGBPToken");

contract('DigitalGBPToken', accounts => {

  var token;
  var _name = 'DigitalGBPToken';
  var _symbol = 'DGBP';
  var _dec = 2;

  const ERROR_MSG = 'VM Exception while processing transaction: revert';

  before('deploy DigitalGBPToken', async function() {
    token = await DigitalGBPToken.deployed();
  });


  describe('Token Attributes', function() {
    it('Has correct name', async function() {
      const name = await token.name();
      assert.equal(name, _name, 'Name is correct');
    });
    it('Has correct symbol', async function() {
      const symbol = await token.symbol();
      assert.equal(symbol, _symbol, 'Symbol is correct');
    });
    it('Has correct decimals', async function() {
      const dec = await token.decimals();
      assert.equal(dec, _dec, 'Decimals are correct');
    });
  });

  describe('Minting and Burning Tokens', function() {
    it('Should Mint 100 tokens', async function() {
      await token.mint(accounts[1], 100);
      const totalSupply = await token.balanceOf(accounts[1]);
      assert.equal(totalSupply, 100, 'Minted 100');
    });
    it('Should Mint 100, then Burn 100', async function() {
      token.mint(accounts[1], 100).then(async function() {
        await token.burn(accounts[1], 100);
        const res = await token.balanceOf(accounts[1]);
        console.log("error: " + res + "\n");
        assert.strictEqual(res, 0, 'Burnt 100');
      });
    });
    it('Reject Burn when burning more than total supply', async function() {
      await token.mint(accounts[1], 100);

      let err = null;

      try {
      await token.burn(accounts[1], 210);
    } catch (error) {
      err = error
      console.log("error: " + err + "\n");
    }
      assert.isNotNull(err, 'Burn rejected');

    });
  })
});
