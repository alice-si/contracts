/*
Implements ERC20 Token Standard: https://github.com/ethereum/EIPs/issues/20
*/

pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

contract DigitalEURToken is StandardToken, Ownable {
  using SafeMath for uint256;

  string public name = "DigitalEUR Token";
  uint8 public decimals = 2;
  string public symbol = "DEUR";
  string public version = 'DEUR 1.0';

  event Minted(address indexed to, uint value);
  event Burnt(address indexed from, uint value);

  function mint(address _to, uint256 _value) public onlyOwner {
    totalSupply_ = totalSupply_.add(_value);
    balances[_to] = balances[_to].add(_value);

    emit Minted(_to, _value);
  }

  function burn(address _from, uint256 _value) public onlyOwner {
    require(_from.balance >= _value);

    totalSupply_ = totalSupply_.sub(_value);
    balances[_from] = balances[_from].sub(_value);

    emit Burnt(_from, _value);
  }
}}
