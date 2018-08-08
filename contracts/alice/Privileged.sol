pragma solidity ^0.4.24;


/**
 * @title Privileged
 * @dev The Privileged defines a set of privileges for a smart contract
 */
contract Privileged {
    address public owner;


    event PrivilegeTransferred(string privilege, address indexed previousOwner, address indexed newOwner);

    struct Privilege {
      address owner;
      address controller;
    }

    /**
     * @dev Throws if called by any account other than the privilege owner.
     */
    modifier only(string _privilege) {
        require(msg.sender == privileges[_privilege].owner);
        _;
    }


    mapping(string => Privilege) privileges;


    function createPrivilege(string _privilegeName, address _owner, address _controller) {
        require(privileges[_privilegeName].owner == address(0));
        privileges[_privilegeName] = Privilege(_owner, _controller);
        emit PrivilegeTransferred(_privilegeName, address(0), _owner);
    }


    function revokePrivilege(string _privilegeName) {
        require(msg.sender == privileges[_privilegeName].controller);
        emit PrivilegeTransferred(_privilegeName, privileges[_privilegeName].owner, address(0));
        privileges[_privilegeName] = Privilege(0, 0);
    }


    /**
     * @dev Allows the privilege controller to transfer ownership of a privilege to another account.
     * @param _newOwner The address to transfer privilege ownership to.
     */
    function transferPrivilege(string _privilege, address _newOwner) public {
        require(msg.sender == privileges[_privilege].controller);
        require(_newOwner != address(0));
        privileges[_privilege].owner = _newOwner;
        emit PrivilegeTransferred(_privilege, owner, _newOwner);
    }

}
