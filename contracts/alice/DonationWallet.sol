pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/token/ERC20.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './Project.sol';

contract DonationWallet is Ownable {
    using SafeMath for uint256;


  function donate(ERC20 _token, uint _amount, Project _project) onlyOwner {
    _token.approve(address(_project), _amount);
    _project.donateFromWallet(_amount);
  }

  function refund(ERC20 _token, uint _amount) onlyOwner {
    _token.transfer(owner, _amount);
  }

  function balance(ERC20 _token) constant returns(uint256){
    return _token.balanceOf(this);
  }

}