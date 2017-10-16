pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/token/ERC20.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './Project.sol';
import './ProjectCatalog.sol';

contract DonationWallet is Ownable {
  using SafeMath for uint256;

  ProjectCatalog projectCatalog;

  function DonationWallet(ProjectCatalog _projectCatalog) {
    projectCatalog = _projectCatalog;
  }

  function donate(ERC20 _token, uint _amount, string _projectName) onlyOwner {
    address projectAddress = projectCatalog.getProjectAddress(_projectName);
    require(projectAddress != address(0));

    _token.approve(projectAddress, _amount);
    Project(projectAddress).donateFromWallet(_amount);
  }

  function refund(ERC20 _token, uint _amount) onlyOwner {
    _token.transfer(owner, _amount);
  }

  function balance(ERC20 _token) constant returns(uint256){
    return _token.balanceOf(this);
  }

}