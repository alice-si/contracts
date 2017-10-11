pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './ImpactRegistry.sol';
import './ImpactLinker.sol';


contract OffChainImpactLinker is Ownable, ImpactLinker {
    using SafeMath for uint256;

   function OffChainImpactLinker(ImpactRegistry _impactRegistry)
     ImpactLinker(_impactRegistry) { }

   function linkDirectly(string _impactId, address _account, uint _impactVal) external onlyOwner {
     require(registry.getBalance(_account) >= _impactVal);
     uint unLinked = registry.getImpactTotalValue(_impactId).sub(registry.getImpactLinked(_impactId));
     require(unLinked >= _impactVal);

     //registry.registerImpact(_impactId, _account, _impactVal);
   }


}