pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './ImpactRegistry.sol';


contract ImpactLinker is Ownable {

    ImpactRegistry public registry;

    modifier onlyRegistry {
        require (msg.sender == address(registry));
        _;
    }

    function ImpactLinker(ImpactRegistry _impactRegistry) {
        registry = _impactRegistry;
    }

    function linkImpact(string impactId) external onlyRegistry {}

}