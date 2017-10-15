pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './ImpactLinker.sol';


contract ImpactRegistry is Ownable {
  using SafeMath for uint256;

  modifier onlyMaster {
    require (msg.sender == owner || msg.sender == masterContract);
    _;
  }

  modifier onlyLinker {
    require(msg.sender != address(linker));
    _;
  }

  address public masterContract;
  ImpactLinker public linker;

  /* This creates a map with donations per user */
  mapping (address => uint) accountBalances;

  /* Additional structure to help to iterate over donations */
  address[] accountIndex;

  uint public unit;

  struct Impact {
    uint value;
    uint linked;
    uint count;
    mapping(uint => address) addresses;
    mapping(address => uint) values;
  }

  /* Structures that store a match between validated outcomes and donations */
  mapping (string => Impact) impacts;


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

  function setLinker(ImpactLinker _linker) onlyOwner {
    linker = _linker;
  }

  function registerOutcome(string _name, uint _value) onlyMaster{
    impacts[_name] = Impact(_value, 0, 0);
  }

  function linkImpact(string _name) onlyOwner {
    linker.linkImpact(_name);
  }

  function payBack(address _account) onlyMaster{
    accountBalances[_account] = 0;
  }



  function registerImpact(string _impactId, uint _accountIndex, uint _linkedValue) onlyLinker {
    Impact storage impact = impacts[_impactId];
    address account = this.getAccount(_accountIndex);
    if (impact.values[account] == 0) {
      impact.addresses[impact.count++] = account;
    }

    require(impact.value.sub(impact.linked) >= _linkedValue);

    updateBalance(_accountIndex, _linkedValue);

    impact.values[account] = impact.values[account].add(_linkedValue);
    impact.linked = impact.linked.add(_linkedValue);
  }

  function updateBalance(uint _index, uint _linkedValue) internal {
    uint oldBalance = accountBalances[accountIndex[_index]];
    uint newBalance = oldBalance.sub(_linkedValue);

    accountBalances[accountIndex[_index]] = newBalance;
    if (newBalance == 0) {
      accountIndex[_index] = accountIndex[accountIndex.length-1];
      accountIndex.length = accountIndex.length - 1;
    }
  }


  function getAccountsCount() constant returns(uint) {
    return accountIndex.length;
  }

  function getAccount(uint _index) constant returns(address) {
    return accountIndex[_index];
  }

  function getBalance(address _donorAddress) constant returns(uint) {
    return accountBalances[_donorAddress];
  }

  function getImpactCount(string outcome) constant returns(uint) {
    return impacts[outcome].count;
  }

  function getImpactLinked(string outcome) constant returns(uint) {
    return impacts[outcome].linked;
  }

  function getImpactTotalValue(string outcome) constant returns(uint) {
    return impacts[outcome].value;
  }

  function getImpactDonor(string outcome, uint index) constant returns(address) {
    return impacts[outcome].addresses[index];
  }

  function getImpactValue(string outcome, address addr) constant returns(uint) {
    return impacts[outcome].values[addr];
  }

}