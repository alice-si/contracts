pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import './ImpactRegistry.sol';
import './ImpactLinker.sol';


contract OffChainImpactLinker is ImpactLinker {

    constructor(ImpactRegistry _impactRegistry)
    ImpactLinker(_impactRegistry) public {
    }

   function linkDirectly(bytes32 _claimId, uint _accountIndex, uint _impactVal) external onlyOwner {
     registry.registerImpact(_claimId, _accountIndex, _impactVal);
   }

    function linkImpact(bytes32 /*_claimId*/) external {
        assert(false);
    }


}
