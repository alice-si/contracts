pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './SmartImpactLinker.sol';


contract ImpactRegistry is Ownable {
  using SafeMath for uint256;

  modifier onlyMaster {
    if (msg.sender != owner && msg.sender != masterContract)
        throw;
    _;
  }

  modifier onlyLinker {
    if (msg.sender != address(linker))
    throw;
    _;
  }

  address public masterContract;
  SmartImpactLinker public linker;

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

  function setLinker(SmartImpactLinker _linker) onlyOwner {
    linker = _linker;
  }

  function registerOutcome(string _name, uint _value) onlyMaster{
    impacts[_name] = Impact(_value, 0, 0, 0);
  }

  function linkImpact(string _name) onlyOwner {
    linker.linkImpact(_name);
  }

  function payBack(address _account) onlyMaster{
    accountBalances[_account] = 0;
  }

  function updateBalance(uint _index, uint _newBalance) onlyLinker {
    accountBalances[accountIndex[_index]] = _newBalance;
    if (_newBalance == 0) {
      accountIndex[_index] = accountIndex[accountIndex.length-1];
      accountIndex.length = accountIndex.length - 1;
    }
  }

  function updateImpact(string _impactId, address _account, uint _impactValue) onlyLinker {
    Impact impact = impacts[_impactId];
    if (impact.values[_account] == 0) {
      impact.addresses[impact.count++] = _account;
    }

    impact.values[_account] = impact.values[_account].add(_impactValue);
    impact.linked = impact.linked.add(_impactValue);
  }


  function getAccountsCount() constant returns(uint) {
    return accountIndex.length;
  }

  function getAccount(uint _index) returns(address) {
    return accountIndex[_index];
  }

  function getBalance(address _donorAddress) constant returns(uint) {
    return accountBalances[_donorAddress];
  }

  function getImpactCount(string outcome) constant returns(uint) {
    return impacts[outcome].count;
  }

  function getImpactLinked(string outcome) returns(uint) {
    return impacts[outcome].linked;
  }

  function getImpactTotalValue(string outcome) returns(uint) {
    return impacts[outcome].value;
  }

  function getImpactDonor(string outcome, uint index) constant returns(address) {
    return impacts[outcome].addresses[index];
  }

  function getImpactValue(string outcome, address addr) constant returns(uint) {
    return impacts[outcome].values[addr];
  }

  /* This unnamed function is called whenever someone tries to send ether to it */
  function () {
    throw;     // Prevents accidental sending of ether
  }

}