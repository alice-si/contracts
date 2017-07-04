/*
Implements ERC 20 Token standard: https://github.com/ethereum/EIPs/issues/20
*/

pragma solidity ^0.4.11;

import '../zeppelin/Ownable.sol';
import '../zeppelin/StandardToken.sol';
import '../zeppelin/SafeMath.sol';

import "./Token.sol";

contract AliceToken is StandardToken, Ownable {
    using SafeMath for uint256;

    string public name = "Alice Token";
    uint8 public decimals = 2;
    string public symbol = "ALT";
    string public version = 'ALT 1.0';


    function mint(address _to, uint256 _value) onlyOwner {
        totalSupply = totalSupply.add(_value);
        balances[_to] =  balances[_to].add(_value);

        MintEvent(_to, _value);
    }

    function destroy(address _from, uint256 _value) onlyOwner {
        totalSupply = totalSupply.sub(_value);
        balances[_from] = balances[_from].sub(_value);

        DestroyEvent(_from, _value);
    }

    event MintEvent(address indexed to, uint value);
    event DestroyEvent(address indexed from, uint value);
}