pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import './ImpactRegistry.sol';
import './ImpactLinker.sol';


contract FlexibleImpactLinker is ImpactLinker {
    using SafeMath for uint256;

    uint public unit;

    /* Structures that store a match between validated outcome claims and donations */
    mapping (bytes32 => ImpactRegistry.Impact) impact;
    mapping (bytes32 => uint) linkingCursors;

   constructor(ImpactRegistry _impactRegistry, uint _unit)
     ImpactLinker(_impactRegistry) public {
        unit = _unit;
    }

    function updateUnit(uint _value) public onlyOwner {
        unit = _value;
    }

    function linkImpact(bytes32 _claimId) external onlyRegistry {
      uint value = registry.getImpactTotalValue(_claimId);
      uint linked = registry.getImpactLinked(_claimId);
      uint left = value.sub(linked);

      if (left > 0) {
        uint i = linkingCursors[_claimId];
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

          registry.registerImpact(_claimId, i, impactVal);

          //Update cursor
          if (balance == impactVal) {
            i--;
          }

          uint accountsCount = registry.getAccountsCount();
          if (accountsCount > 0) {
            linkingCursors[_claimId] = (i + 1) % accountsCount;
          } else {
            linkingCursors[_claimId] = 0;
          }
        }
      }

    }

}
