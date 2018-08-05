pragma solidity ^0.4.22;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';


/**
 * @title Escapable
 * @dev The Escapable contract enables escapeController to transfer funds out of the contract
 * in case of emergency.
 */
contract Escapable {
    address public escapeController;
    address public escapeTarget;


    event FundsEscaped(address indexed destination, uint indexed amount);

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyEscapeController() {
        require(msg.sender == escapeController);
        _;
    }


    /**
     * @dev The Escapable constructor sets the initial _escapeController and _escapeTarget.
     * account.
     */
    constructor(address _escapeController, address _escapeTarget) {
        escapeController = _escapeController;
        escapeTarget = _escapeTarget;
    }


    function escape(ERC20 token) onlyEscapeController {
        uint total = token.balanceOf(this);
        if (token.transfer(escapeTarget, total)) {
            emit FundsEscaped(escapeTarget, total);
        }
    }


    /**
     * @dev Allows the current escape controller to transfer control of the contract
     * to a new escape controller.
     * @param _newEscapeController The address to transfer control to.
     */
    function changeEscapeController(address _newEscapeController) public onlyEscapeController {
        escapeController = _newEscapeController;
    }

}
