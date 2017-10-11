pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './ImpactRegistry.sol';
import './ImpactLinker.sol';


contract OffChainImpactLinker is Ownable, ImpactLinker {
    using SafeMath for uint256;

   function OffChainImpactLinker(ImpactRegistry _impactRegistry)
     ImpactLinker(_impactRegistry) { }

   function linkDirectly(string _impactId, uint _accountIndex, uint _impactVal) external onlyOwner {
     registry.registerImpact(_impactId, _accountIndex, _impactVal);
   }


}