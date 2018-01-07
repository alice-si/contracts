pragma solidity ^0.4.18;

import './ProjectWithBonds.sol';
import '../ProjectCatalog.sol';
import '../DonationWallet.sol';

contract InvestmentWallet is DonationWallet {

    ProjectCatalog projectCatalog;

    function InvestmentWallet(ProjectCatalog _projectCatalog) public
        DonationWallet(_projectCatalog) {
        //projectCatalog = 0x0;
    }


//    function invest(ERC20 _token, uint _amount, string _projectName) public onlyOwner {
//        address projectAddress = projectCatalog.getProjectAddress(_projectName);
//        require(projectAddress != address(0));
//
//        _token.approve(projectAddress, _amount);
//        ProjectWithBonds(projectAddress).investFromWallet(_token, _amount);
//    }

}