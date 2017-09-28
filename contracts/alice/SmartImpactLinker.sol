pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './ImpactRegistry.sol';


contract SmartImpactLinker is Ownable {
    using SafeMath for uint256;

    ImpactRegistry public registry;
    uint public unit;
    /* Structures that store a match between validated outcomes and donations */
    mapping (string => ImpactRegistry.Impact) impact;
    mapping (string => uint) linkingCursors;


    modifier onlyRegistry {
        require (msg.sender == address(registry));
        _;
    }

    function SmartImpactLinker(ImpactRegistry _impactRegistry, uint _unit) {
        registry = _impactRegistry;
        unit = _unit;
    }

    function updateUnit(uint _value) onlyOwner {
        unit = _value;
    }

    function linkImpact(string impactId) onlyOwner {
//        uint left = impact.value.sub(impact.linked);
//        if (left > 0) {
//
//            uint i = linkingCursor[impact.name];
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
//            if (accountIndex.length > 0) {
//                i = (i + 1) % accountIndex.length;
//            } else {
//                i = 0;
//            }
//
//            impact[_name].accountCursor = i;
//        }
    }

}