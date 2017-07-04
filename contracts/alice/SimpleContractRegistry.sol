pragma solidity ^0.4.11;

import '../zeppelin/Ownable.sol';

contract SimpleContractRegistry is Ownable {

  mapping (bytes32 => address) public contracts;

  function registerContract(bytes32 _name, address _contractAddress) onlyOwner {
    contracts[_name] = _contractAddress;
  }

}