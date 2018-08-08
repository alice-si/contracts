pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import './TwoPhaseTransfers.sol';
import './CuratedTransfers.sol';


/**
 * @title CuratedWithWarnings
 * @dev The CuratedWithWarnings contract adds a Whistleblower role to Curated contract that may block a transfer
        but is unable to resume. Blocking may happen only once per transfer.
 */
contract CuratedWithWarnings is CuratedTransfers {

    mapping(uint => bool) wasMarked;
    mapping(address => bool) whistleblowers;

    constructor(address[] _whistleblowers, address _curator, address[] _proposers, address[] _validators)
        CuratedTransfers(_curator, _proposers, _validators) public {

        for(uint i=0; i<_whistleblowers.length; i++) {
            whistleblowers[_whistleblowers[i]] = true;
        }
    }


    function blockTransfer(uint _transferId) public {
        require(msg.sender == curator || (whistleblowers[msg.sender] && !wasMarked[_transferId]));
        isBlocked[_transferId] = true;
        wasMarked[_transferId] = true;
    }

}
