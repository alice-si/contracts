pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './ImpactRegistry.sol';
import './ImpactLinker.sol';


contract FlexibleImpactLinker is ImpactLinker {
    using SafeMath for uint256;

    uint public unit;
    /* Structures that store a match between validated outcomes and donations */
    mapping (string => ImpactRegistry.Impact) impact;
    mapping (string => uint) linkingCursors;

   function FlexibleImpactLinker(ImpactRegistry _impactRegistry, uint _unit)
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

          //Update registry
          registry.updateImpact(impactId, account, impactVal);
          registry.updateBalance(i, balance.sub(impactVal));

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
//
//            if (accountBalances[accountIndex[i]] >= 0) {
//                /*Calculate shard */
//                uint shard = accountBalances[accountIndex[i]];
//                if (shard > left) {
//                    shard = left;
//                }
//
//                if (shard > unit) {
//                    shard = unit;
//                }
//
//                /* Update balances */
//                accountBalances[accountIndex[i]] = accountBalances[accountIndex[i]].sub(shard);
//
//                /* Update impact */
//                if (impact[_name].values[accountIndex[i]] == 0) {
//                    impact[_name].addresses[impact[_name].count++] = accountIndex[i];
//                }
//
//                impact[_name].values[accountIndex[i]] = impact[_name].values[accountIndex[i]].add(shard);
//                impact[_name].linked = impact[_name].linked.add(shard);
//
//                /* Move to next account removing empty ones */
//                if (accountBalances[accountIndex[i]] == 0) {
//                    accountIndex[i] = accountIndex[accountIndex.length-1];
//                    accountIndex.length = accountIndex.length - 1;
//                    i--;
//                }
//            }
//
//            /* Update cursor */
//
//
//
//            impact[_name].accountCursor = i;
//        }
    }

}