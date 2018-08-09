pragma solidity ^0.4.11;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';


/**
 * @title TwoPhaseTransfers
 * @dev The TwoPhaseTransfers add an extra security for transfer processing introducing an extra confirmation step.
 */
contract TwoPhaseTransfers {
    bool checkProposers;
    bool checkValidators;
    mapping(address => bool) proposers;
    mapping(address => bool) validators;

    uint nonce = 1;

    struct TransferProposal {
        ERC20 token;
        address to;
        uint value;
    }

    mapping(uint => TransferProposal) transferProposals;


    event TransferProposed(uint indexed id, address indexed token, address indexed to, uint value);
    event TransferConfirmed(uint indexed id, address indexed token, address indexed to, uint value);

    modifier onlyProposer() {
        require(!checkProposers || proposers[msg.sender]);
        _;
    }

    modifier onlyValidator() {
        require(!checkValidators  || validators[msg.sender]);
        _;
    }


    constructor(address[] _proposers, address[] _validators) public {
        if (_proposers.length > 0) {
            checkProposers = true;
            for(uint i=0; i<_proposers.length; i++) {
                proposers[_proposers[i]] = true;
            }
        }

        if (_validators.length > 0) {
            checkValidators = true;
            for(uint j=0; j<_validators.length; j++) {
                validators[_validators[j]] = true;
            }
        }

    }

    function proposeTransfer(ERC20 token, address to, uint value) public onlyProposer returns(uint) {
        uint id = nonce++;
        transferProposals[id] = TransferProposal(token, to, value);
        emit TransferProposed(id, token, to, value);
        return id;
    }

    function confirmTransfer(uint _transferId) public onlyValidator {
        TransferProposal storage proposal = transferProposals[_transferId];
        require(ERC20(proposal.token).transfer(proposal.to, proposal.value));
        emit TransferConfirmed(_transferId, proposal.token, proposal.to, proposal.value);
    }






}
