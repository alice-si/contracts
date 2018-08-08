pragma solidity ^0.4.24;

contract ContractProvider {
    function contracts(bytes32 contractName) public returns (address addr);
}