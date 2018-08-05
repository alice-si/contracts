pragma solidity ^0.4.22;

import 'zeppelin-solidity/contracts/token/ERC20.sol';
import './CuratedWithWarnings.sol';


/**
 * @title Vault
 * @dev The Vault contract is a container for token storage that implements extra security measures.
 */
contract Vault is CuratedWithWarnings {

    constructor(address[] _whistleblowers, address _curator, address[] _proposers, address[] _validators)
        CuratedWithWarnings(_whistleblowers, _curator, _proposers, _validators) {
    }

}
