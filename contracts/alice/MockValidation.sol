pragma solidity ^0.4.22;

//Contract only for testing purposes.
//Don't connect to other contracts or use in a production environment.
//It registers and store performed validations.
contract MockValidation {

    event ValidationEvent(uint time, address indexed validator, string outcome, uint value);

    struct Validation {
        uint time;
        address validator;
        string outcome;
        uint value;
    }

    Validation[] validations;

    function validate(string outcome, uint value) {
        Validation memory validation = Validation(now, msg.sender, outcome, value);
        validations.push(validation);
        ValidationEvent(validation.time, validation.validator, validation.outcome, validation.value);
    }

    function getValidationsCount() constant public returns(uint count) {
        return validations.length;
    }

    function getValidatorByIndex(uint index) constant public returns(address validator) {
        return validations[index].validator;
    }

    function getOutcomeByIndex(uint index) constant public returns(string outcome) {
        return validations[index].outcome;
    }

    function getValueByIndex(uint index) constant public returns(uint value) {
        return validations[index].value;
    }

}