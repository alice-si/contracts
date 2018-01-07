pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/token/ERC20.sol';

import "./Coupon.sol";
import "../Project.sol";

contract ProjectWithBonds is Project {

    Coupon coupon;

    /* This generates a public event on the blockchain that will notify clients */
    event CouponIssuedEvent(address indexed to, uint value);
    event CouponRepaidEvent(address indexed from, uint value);

    uint256 public couponNominalPrice;


    function ProjectWithBonds(string _name, uint256 _couponNominalPrice) public
        Project(_name) {
        couponNominalPrice = _couponNominalPrice;
        coupon = new Coupon(couponNominalPrice);
    }


    function investFromWallet(ERC20 _token, uint _amount) public {
        require(_token.transferFrom(msg.sender, beneficiaryAddress, _amount));

        uint256 couponCount = _amount.div(couponNominalPrice);
        coupon.mint(msg.sender, couponCount);
        CouponIssuedEvent(msg.sender, couponCount);
    }


    function unlockOutcome(ERC20 _token, string _name, uint _value) public {
        require (msg.sender == judgeAddress);
        require (_value <= total);

        _token.transfer(beneficiaryAddress, _value);
        total = total.sub(_value);

        ImpactRegistry(IMPACT_REGISTRY_ADDRESS).registerOutcome(_name, _value);

        OutcomeEvent(_name, _value);
    }


    function payBack(ERC20 _token, address account) public onlyOwner {
        uint balance = getBalance(account);
        if (balance > 0) {
            _token.transfer(account, balance);
            total = total.sub(accountBalances[account]);
            ImpactRegistry(IMPACT_REGISTRY_ADDRESS).payBack(account);
        }
    }


    function getCoupon() public view returns(Coupon) {
        return coupon;
    }
}