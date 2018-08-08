pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import './ImpactRegistry.sol';
import './ImpactLinker.sol';


contract FlexibleImpactLinker is ImpactLinker {
    using SafeMath for uint256;

    uint public unit;
    /* Structures that store a match between validated outcomes and donations */
    mapping (string => ImpactRegistry.Impact) impact;
    mapping (string => uint) linkingCursors;

   constructor(ImpactRegistry _impactRegistry, uint _unit)
     ImpactLinker(_impactRegistry) {
        unit = _unit;
    }

    function updateUnit(uint _value) onlyOwner {
        unit = _value;
    }

    function linkImpact(string impactId) external onlyRegistry {
      uint value = registry.getImpactTotalValue(impactId);
      uint linked = registry.getImpactLinked(impactId);
      uint left = value.sub(linked);

      if (left > 0) {
        uint i = linkingCursors[impactId];
        address account = registry.getAccount(i);
        uint balance = registry.getBalance(account);
        if (balance >= 0) {

          //Calculate impact
          uint impactVal = balance;
          if (impactVal > left) {
              impactVal = left;
          }
          if (impactVal > unit) {
              impactVal = unit;
          }

          registry.registerImpact(impactId, i, impactVal);

          //Update cursor
          if (balance == impactVal) {
            i--;
          }

          uint accountsCount = registry.getAccountsCount();
          if (accountsCount > 0) {
            linkingCursors[impactId] = (i + 1) % accountsCount;
          } else {
            linkingCursors[impactId] = 0;
          }
        }
      }

    }

}