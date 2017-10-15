pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract ProjectCatalog is Ownable {

    mapping (bytes32 => address) public projects;

    function addProject(bytes32 _name, address _projectAddress) onlyOwner {
        require(projects[_name] == address(0));
        projects[_name] = _projectAddress;
    }

    function getProjectAddress(bytes32 _name) constant returns(address) {
        return projects[_name];
    }

}