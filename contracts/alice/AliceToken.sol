/*
Implements ERC 20 Token standard: https://github.com/ethereum/EIPs/issues/20
*/

pragma solidity ^0.4.11;

import "./Token.sol";
import "../Owned.sol";

contract AliceToken is Token, Owned {

    string public name = "Alice Token";
    uint8 public decimals = 2;
    string public symbol = "ALT";
    string public version = 'ALT 1.0';


    function transfer(address _to, uint256 _value) {
        //Default assumes totalSupply can't be over max (2^256 - 1).
        if (balances[msg.sender] >= _value && balances[_to] + _value > balances[_to]) {
            balances[msg.sender] -= _value;
            balances[_to] += _value;
            Transfer(msg.sender, _to, _value);
        } else { throw; }
    }

    function transferFrom(address _from, address _to, uint256 _value) {
        if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && balances[_to] + _value > balances[_to]) {
            balances[_to] += _value;
            balances[_from] -= _value;
            allowed[_from][msg.sender] -= _value;
            Transfer(_from, _to, _value);
        } else { throw; }
    }

    function balanceOf(address _owner) constant returns (uint256 balance) {
        return balances[_owner];
    }

    function approve(address _spender, uint256 _value) returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) constant returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }

    function mint(address _to, uint256 _value) onlyOwner {
        if (totalSupply + _value < totalSupply) throw;
            totalSupply += _value;
            balances[_to] += _value;

            MintEvent(_to, _value);
    }

    function destroy(address _from, uint256 _value) onlyOwner {
        if (balances[_from] < _value || _value < 0) throw;
            totalSupply -= _value;
            balances[_from] -= _value;

            DestroyEvent(_from, _value);
    }

    mapping (address => uint256) balances;
    mapping (address => mapping (address => uint256)) allowed;

    event MintEvent(address indexed to, uint value);
    event DestroyEvent(address indexed from, uint value);
}