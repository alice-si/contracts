pragma solidity ^0.4.18;

import './ProjectWithBonds.sol';
import './Coupon.sol';
import '../ProjectCatalog.sol';
import '../DonationWallet.sol';

contract InvestmentWallet is DonationWallet {

    function InvestmentWallet(ProjectCatalog _projectCatalog) public
        DonationWallet(_projectCatalog) {
    }


    function invest(uint _amount, string _projectName) public onlyOwner {
        address projectAddress = projectCatalog.getProjectAddress(_projectName);
        require(projectAddress != address(0));
        ERC20 token = ProjectWithBonds(projectAddress).getToken();

        token.approve(projectAddress, _amount);
        ProjectWithBonds(projectAddress).investFromWallet(_amount);
    }


    function redeemCoupons(uint _amount, string _projectName) public onlyOwner {
        address projectAddress = projectCatalog.getProjectAddress(_projectName);
        require(projectAddress != address(0));
        ProjectWithBonds project = ProjectWithBonds(projectAddress);
        Coupon coupon = project.getCoupon();
        require(coupon.balanceOf(this) >= _amount);

        project.redeemCoupons(_amount);
    }

}