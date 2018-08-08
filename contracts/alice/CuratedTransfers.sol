pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import './TwoPhaseTransfers.sol';


/**
 * @title CuratedTransfers
 * @dev The CuratedTransfers contract introduces a curator role that may block and resume any pending transfer.
 */
contract CuratedTransfers is TwoPhaseTransfers {

    mapping(uint => bool) isBlocked;
    address public curator;


    modifier onlyCurator() {
        require(msg.sender == curator);
        _;
    }


    constructor(address _curator, address[] _proposers, address[] _validators)
    TwoPhaseTransfers(_proposers, _validators) {
        curator = _curator;
    }


    function blockTransfer(uint _transferId) onlyCurator {
        isBlocked[_transferId] = true;
    }


    function resumeTransfer(uint _transferId) onlyCurator {
        isBlocked[_transferId] = false;
    }


    function confirmTransfer(uint _transferId) onlyValidator {
        require(!isBlocked[_transferId]);
        super.confirmTransfer(_transferId);
    }

}
