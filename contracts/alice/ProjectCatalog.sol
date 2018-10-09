pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import './StringUtils.sol';

contract ProjectCatalog is Ownable {
    using StringUtils for string;

    mapping (bytes32 => address) public projects;

    function addProject(string _name, address _projectAddress) public onlyOwner {
        bytes32 nameAsBytes = _name.stringToBytes32();
        require(projects[nameAsBytes] == address(0));
        projects[nameAsBytes] = _projectAddress;

        emit AddedProject(nameAsBytes, _projectAddress);

    }

    function getProjectAddress(string _name) public view returns(address) {
        bytes32 nameAsBytes = _name.stringToBytes32();

        return projects[nameAsBytes];
    }

    event AddedProject(bytes32 key, address _to);
}
