/*
Implements ERC 20 Token standard: https://github.com/ethereum/EIPs/issues/20
*/

pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';

contract Coupon is StandardToken, Ownable {
    using SafeMath for uint256;

    string public name = "Alice Coupon";
    uint8 public decimals = 2;
    string public symbol = "ALC";
    string public version = 'ALC 1.0';

    uint256 public nominalPrice;

    constructor(uint256 _price) public {
        nominalPrice = _price;
    }


    function mint(address _to, uint256 _value) public onlyOwner {
        totalSupply_ = totalSupply_.add(_value);
        balances[_to] =  balances[_to].add(_value);

        emit MintEvent(_to, _value);
    }

    function burn(address _from, uint256 _value) public onlyOwner {
        totalSupply_ = totalSupply_.sub(_value);
        balances[_from] = balances[_from].sub(_value);

        emit BurnEvent(_from, _value);
    }

    event MintEvent(address indexed to, uint value);
    event BurnEvent(address indexed from, uint value);
}