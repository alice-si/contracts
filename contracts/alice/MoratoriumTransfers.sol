pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/token/ERC20.sol';
import './TwoPhaseTransfers.sol';


/**
 * @title MoratioriumTransfers
 * @dev The MoratioriumTransfers allows transfers to be confirmed only after a cooldown period.
 */
contract MoratoriumTransfers is TwoPhaseTransfers {

    mapping(uint => uint) availableFrom;
    uint public moratoriumPeriod;


    function MoratoriumTransfers(uint _moratoriumPeriod, address[] _proposers, address[] _validators)
        TwoPhaseTransfers(_proposers, _validators) {
        moratoriumPeriod = _moratoriumPeriod;
    }

    function proposeTransfer(ERC20 token, address to, uint value) onlyProposer returns(uint) {
        uint id = super.proposeTransfer(token, to, value);
        availableFrom[id] = now + moratoriumPeriod;
    }

    function confirmTransfer(uint _transferId) onlyValidator {
        TransferProposal storage proposal = transferProposals[_transferId];
        require(now > availableFrom[_transferId]);
        super.confirmTransfer(_transferId);
    }






}
