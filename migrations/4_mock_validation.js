var MockValidation = artifacts.require("MockValidation");

module.exports = function (deployer) {
  deployer.deploy(MockValidation).then(function () {
    console.log("Mock Validation deployed to: " + MockValidation.address);
  });
};
