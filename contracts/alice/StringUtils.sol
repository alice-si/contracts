pragma solidity ^0.4.24;


library StringUtils {

    function stringToBytes32(string memory source) pure internal returns (bytes32 result) {
	    assembly {
		    result := mload(add(source, 32))
	    }
    }
}
