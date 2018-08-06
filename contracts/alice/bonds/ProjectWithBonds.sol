pragma solidity ^0.4.22;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';

import "./Coupon.sol";
import "../Project.sol";

contract ProjectWithBonds is Project {


    /* This generates a public event on the blockchain that will notify clients */
    event CouponIssuedEvent(address indexed to, uint value);
    event CouponRedeemEvent(address indexed from, uint value);

    /* In percent with double digits precision */
    uint256 public couponInterestRate;
    uint256 public couponNominalPrice;
    uint256 public liability;
    uint256 public validatedLiability;
    Coupon coupon;


    constructor(string _name, uint256 _couponNominalPrice, uint256 _couponInterestRate) public
    Project(_name) {
        couponNominalPrice = _couponNominalPrice;
        couponInterestRate = _couponInterestRate;
        coupon = new Coupon(couponNominalPrice);
    }


    function investFromWallet(uint _amount) public {
        require(getToken().transferFrom(msg.sender, beneficiaryAddress, _amount));

        uint256 couponCount = _amount.div(couponNominalPrice);
        coupon.mint(msg.sender, couponCount);
        liability = liability.add(getPriceWithInterests(_amount));

        emit CouponIssuedEvent(msg.sender, couponCount);
    }


    function unlockOutcome(string _name, uint _value) public {
        require (msg.sender == validatorAddress);
        require (_value <= total);
        uint256 unvalidatedLiability = liability.sub(validatedLiability);

        if (_value > unvalidatedLiability) {
          uint256 surplus = _value.sub(unvalidatedLiability);
          getToken().transfer(beneficiaryAddress, surplus);
          validatedLiability = validatedLiability.add(unvalidatedLiability);
        } else {
          validatedLiability = validatedLiability.add(_value);
        }

        total = total.sub(_value);

        ImpactRegistry(IMPACT_REGISTRY_ADDRESS).registerOutcome(_name, _value);

        emit OutcomeEvent(_name, _value);
    }


    function redeemCoupons(uint256 _amount) public {
        uint256 redeemedValue = getPriceWithInterests(_amount.mul(couponNominalPrice));
        require(validatedLiability >= redeemedValue);

        coupon.burn(msg.sender, _amount);
        getToken().transfer(msg.sender, redeemedValue);

        liability = liability.sub(redeemedValue);
        validatedLiability = validatedLiability.sub(redeemedValue);

        emit CouponRedeemEvent(msg.sender, _amount);
    }

    function getPriceWithInterests(uint256 _value) public view returns(uint256) {
        return _value.add(_value.mul(couponInterestRate).div(10000));
    }


    function getCoupon() public view returns(Coupon) {
        return coupon;
    }


    function getLiability() public view returns(uint256) {
        return liability;
    }


    function getValidatedLiability() public view returns(uint256) {
        return validatedLiability;
    }
}