var AliceToken = artifacts.require("AliceToken");

module.exports = async function(deployer) {
  await deployer.deploy(AliceToken).then(function() {
    console.log("Alice Token deployed to: " + AliceToken.address);
  });
};
