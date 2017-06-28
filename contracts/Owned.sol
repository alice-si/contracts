pragma solidity ^0.4.2;

contract Owned {

	address owner;

	function Owned() {
		owner = msg.sender;
	}

	modifier onlyOwner {
        if (msg.sender != owner)
            throw;
        _;
    }
}
