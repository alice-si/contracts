pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';


contract ImpactRegistry is Ownable {
  using SafeMath for uint256;

  modifier onlyMaster {
    if (msg.sender != owner && msg.sender != masterContract)
        throw;
    _;
  }

  address public masterContract;

  /* This creates a map with donations per user */
  mapping (address => uint) accountBalances;

  /* Additional structure to help to iterate over donations */
  address[] accountIndex;

  uint public unit;

  struct Impact {
    uint value;
    uint linked;
    uint accountCursor;
    uint count;
    mapping(uint => address) addresses;
    mapping(address => uint) values;
  }

  /* Structures that store a match between validated outcomes and donations */
  mapping (string => Impact) impact;


  function ImpactRegistry(address _masterContract, uint _unit) {
    masterContract = _masterContract;
    unit = _unit;
  }

  function registerDonation(address _from, uint _value) onlyMaster {
    if (accountBalances[_from] == 0) {
      accountIndex.push(_from);
    }

    accountBalances[_from] = accountBalances[_from].add(_value);
  }

  function setUnit(uint _value) onlyOwner {
    unit = _value;
  }

  function setMasterContract(address _contractAddress) onlyOwner {
      masterContract = _contractAddress;
  }

  function registerOutcome(string _name, uint _value) onlyMaster{
    impact[_name] = Impact(_value, 0, 0, 0);
  }

  function linkImpact(string _name) onlyOwner {
    uint left = impact[_name].value.sub(impact[_name].linked);
    if (left > 0) {

      uint i = impact[_name].accountCursor;

      if (accountBalances[accountIndex[i]] >= 0) {
        /*Calculate shard */
        uint shard = accountBalances[accountIndex[i]];
        if (shard > left) {
          shard = left;
        }

        if (shard > unit) {
          shard = unit;
        }

        /* Update balances */
        accountBalances[accountIndex[i]] = accountBalances[accountIndex[i]].sub(shard);

        /* Update impact */
        if (impact[_name].values[accountIndex[i]] == 0) {
          impact[_name].addresses[impact[_name].count++] = accountIndex[i];
        }

        impact[_name].values[accountIndex[i]] = impact[_name].values[accountIndex[i]].add(shard);
        impact[_name].linked = impact[_name].linked.add(shard);

        /* Move to next account removing empty ones */
        if (accountBalances[accountIndex[i]] == 0) {
          accountIndex[i] = accountIndex[accountIndex.length-1];
          accountIndex.length = accountIndex.length - 1;
          i--;
        }
      }

      /* Update cursor */

      if (accountIndex.length > 0) {
        i = (i + 1) % accountIndex.length;
      } else {
        i = 0;
      }

      impact[_name].accountCursor = i;
    }
  }

  function payBack(address _account) onlyMaster{
    accountBalances[_account] = 0;
  }

  function getBalance(address _donorAddress) returns(uint) {
    return accountBalances[_donorAddress];
  }

  function getImpactCount(string outcome) returns(uint) {
    return impact[outcome].count;
  }

  function getImpactLinked(string outcome) returns(uint) {
    return impact[outcome].linked;
  }

  function getImpactDonor(string outcome, uint index) returns(address) {
    return impact[outcome].addresses[index];
  }

  function getImpactValue(string outcome, address addr) returns(uint) {
    return impact[outcome].values[addr];
  }

  /* This unnamed function is called whenever someone tries to send ether to it */
  function () {
    throw;     // Prevents accidental sending of ether
  }

}