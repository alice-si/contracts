/*
Implements ERC 20 Token standard: https://github.com/ethereum/EIPs/issues/20
*/

pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/token/StandardToken.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

contract Coupon is StandardToken, Ownable {
    using SafeMath for uint256;

    string public name = "Alice Coupon";
    uint8 public decimals = 2;
    string public symbol = "ALC";
    string public version = 'ALC 1.0';

    uint256 public nominalPrice;

    function Coupon(uint256 _price) {
        nominalPrice = _price;
    }


    function mint(address _to, uint256 _value) public onlyOwner {
        totalSupply = totalSupply.add(_value);
        balances[_to] =  balances[_to].add(_value);

        MintEvent(_to, _value);
    }

    function burn(address _from, uint256 _value) public onlyOwner {
        totalSupply = totalSupply.sub(_value);
        balances[_from] = balances[_from].sub(_value);

        BurnEvent(_from, _value);
    }

    event MintEvent(address indexed to, uint value);
    event BurnEvent(address indexed from, uint value);
}