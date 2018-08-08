pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import './ImpactRegistry.sol';
import './ImpactLinker.sol';


contract OffChainImpactLinker is ImpactLinker {

    constructor(ImpactRegistry _impactRegistry)
    ImpactLinker(_impactRegistry) {
    }

   function linkDirectly(string _impactId, uint _accountIndex, uint _impactVal) external onlyOwner {
     registry.registerImpact(_impactId, _accountIndex, _impactVal);
   }

    function linkImpact(string impactId) external {
        assert(false);
    }


}