pragma solidity ^0.4.22;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';


/**
 * @title OwnableWithRecovery
 * @dev The OwnableWithRecovery extends a classic Ownable contract adding a feature to elect a new owner by
 * a common decision of authorized recovery addresses.
 */
contract OwnableWithRecovery is Ownable {

    event OwnershipTransferAttempt(address indexed fromRecoveryAddress, address indexed newOwner);

    mapping(address => address) public recoveryVote;
    mapping(address => uint) public voteCount;
    uint8 public minVoteCount;

    /**
     * @dev The Ownable constructor sets the original `owner` of the contract to the sender
     * account.
     */
    constructor(address[] _recoveryAddresses, uint8 _minVoteCount)
        Ownable() {
        require(_recoveryAddresses.length >= 2 && _recoveryAddresses.length <= 10);

        owner = msg.sender;
        minVoteCount = _minVoteCount;
        for (uint i=0; i<_recoveryAddresses.length; i++) {
            recoveryVote[_recoveryAddresses[i]] = owner;
        }
        voteCount[owner] = _recoveryAddresses.length;
    }


    /**
     * @dev Allows the current owner to transfer control of the contract to a newOwner.
     * @param _newOwner The address to transfer ownership to.
     */
    function transferOwnership(address _newOwner) public {
        require(_newOwner != address(0));
        require(recoveryVote[msg.sender] != address(0));
        require(recoveryVote[msg.sender] != _newOwner);

        voteCount[recoveryVote[msg.sender]] = voteCount[recoveryVote[msg.sender]] - 1;
        recoveryVote[msg.sender] = _newOwner;
        voteCount[_newOwner] = voteCount[_newOwner] + 1;
        OwnershipTransferAttempt(msg.sender, _newOwner);

        if (voteCount[_newOwner] >= minVoteCount) {
            owner = _newOwner;
            OwnershipTransferred(owner, _newOwner);
        }
    }

}
