var MockValidation = artifacts.require("MockValidation");

contract('Mock Validation', function(accounts) {
  var mockValidation;

  it("should validate", function(done) {
    MockValidation.deployed().then(function(instance) {
      mockValidation = instance;
      return mockValidation.validate("Outcome", 100);
    }).then(function() {
      return mockValidation.getValidationsCount.call();
    }).then(function(count) {
      assert.equal(count, 1, "Should register validation");
      return mockValidation.getValidatorByIndex.call(0);
    }).then(function(validator) {
      assert.equal(validator, accounts[0], "Should register correct validator");
      return mockValidation.getOutcomeByIndex.call(0);
    }).then(function(outcome) {
      assert.equal(outcome, "Outcome", "Should register correct outcome");
      return mockValidation.getValueByIndex.call(0);
    }).then(function(value) {
      return assert.equal(value, 100, "Should register correct value");
    })
      .then(done)
      .catch(done);
  });

});
