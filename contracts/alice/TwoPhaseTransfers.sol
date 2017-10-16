pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/token/ERC20.sol';


/**
 * @title TwoPhaseTransfers
 * @dev The TwoPhaseTransfers add an extra security for transfer processing introducing an extra confirmation step.
 */
contract TwoPhaseTransfers {
    bool checkProposers;
    bool checkValidators;
    mapping(address => bool) proposers;
    mapping(address => bool) validators;

    uint idGenerator;

    struct TransferProposal {
        ERC20 token;
        address to;
        uint value;
    }

    mapping(uint => TransferProposal) transferProposals;


    event TransferProposed(address indexed token, address indexed to, uint indexed value);
    event TransferAuthorized(address indexed token, address indexed to, uint indexed value);

    modifier onlyProposer() {
        require(!checkProposers || proposers[msg.sender]);
        _;
    }

    modifier onlyValidator() {
        require(!checkValidators || validators[msg.sender]);
        _;
    }


    function TwoPhaseTransfers(address[] _proposers, address[] _validators) {
        if (_proposers.length > 0) {
            checkProposers = true;
            for(uint i=0; i<_proposers.length; i++) {
                proposers[_proposers[i]] = true;
            }
        }
    }

    function proposeTransfer(ERC20 token, address to, uint value) onlyProposer returns(uint) {
        uint id = idGenerator++;
        transferProposals[id] = TransferProposal(token, to, value);
        return id;
    }

    function confirmTransfer(uint transferId) {
        TransferProposal proposal = transferProposals[transferId];
        require(ERC20(proposal.token).transfer(proposal.to, proposal.value));
        TransferAuthorized(proposal.token, proposal.to, proposal.value);
    }






}
