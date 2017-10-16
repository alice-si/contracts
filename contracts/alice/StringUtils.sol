pragma solidity ^0.4.11;


library StringUtils {

    function stringToBytes32(string memory source) internal returns (bytes32 result) {
	    assembly {
		    result := mload(add(source, 32))
	    }
    }
}
