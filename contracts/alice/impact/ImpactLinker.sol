pragma solidity ^0.4.22;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import './ImpactRegistry.sol';


contract ImpactLinker is Ownable {

    ImpactRegistry public registry;

    modifier onlyRegistry {
        require (msg.sender == address(registry));
        _;
    }

    constructor(ImpactRegistry _impactRegistry) public {
        registry = _impactRegistry;
    }

    function linkImpact(string impactId) external;

}