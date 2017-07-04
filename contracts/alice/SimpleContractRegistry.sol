pragma solidity ^0.4.11;

import "../Owned.sol";

contract SimpleContractRegistry is Owned {

  mapping (bytes32 => address) public contracts;

  function registerContract(bytes32 _name, address _contractAddress) onlyOwner {
    contracts[_name] = _contractAddress;
  }

}