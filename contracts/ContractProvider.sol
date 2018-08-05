pragma solidity ^0.4.22;

contract ContractProvider {
    function contracts(bytes32 contractName) public returns (address addr);
}