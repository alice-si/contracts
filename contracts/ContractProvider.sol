pragma solidity ^0.4.18;

contract ContractProvider {
    function contracts(bytes32 contractName) public returns (address addr);
}