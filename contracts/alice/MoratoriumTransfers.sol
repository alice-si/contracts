pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';
import './TwoPhaseTransfers.sol';


/**
 * @title MoratioriumTransfers
 * @dev The MoratioriumTransfers allows transfers to be confirmed only after a cooldown period.
 */
contract MoratoriumTransfers is TwoPhaseTransfers {

    mapping(uint => uint) availableFrom;
    uint public moratoriumPeriod;


    constructor(uint _moratoriumPeriod, address[] _proposers, address[] _validators)
        TwoPhaseTransfers(_proposers, _validators) public {
        moratoriumPeriod = _moratoriumPeriod;
    }

    function proposeTransfer(ERC20 token, address to, uint value) public onlyProposer returns(uint) {
        uint id = super.proposeTransfer(token, to, value);
        availableFrom[id] = now + moratoriumPeriod;
    }

    function confirmTransfer(uint _transferId) public onlyValidator {
        // TransferProposal storage proposal = transferProposals[_transferId];
        require(now > availableFrom[_transferId]);
        super.confirmTransfer(_transferId);
    }

}
