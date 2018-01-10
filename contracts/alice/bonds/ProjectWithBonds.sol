pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/token/ERC20.sol';

import "./Coupon.sol";
import "../Project.sol";

contract ProjectWithBonds is Project {


    /* This generates a public event on the blockchain that will notify clients */
    event CouponIssuedEvent(address indexed to, uint value);
    event CouponRepaidEvent(address indexed from, uint value);

    uint256 public couponNominalPrice;
    uint256 public liability;
    uint256 public validatedLiability;
    Coupon coupon;


    function ProjectWithBonds(string _name, uint256 _couponNominalPrice) public
    Project(_name) {
        couponNominalPrice = _couponNominalPrice;
        coupon = new Coupon(couponNominalPrice);
    }


    function investFromWallet(uint _amount) public {
        require(getToken().transferFrom(msg.sender, beneficiaryAddress, _amount));

        uint256 couponCount = _amount.div(couponNominalPrice);
        coupon.mint(msg.sender, couponCount);
        liability = liability.add(_amount);

        CouponIssuedEvent(msg.sender, couponCount);
    }


    function unlockOutcome(string _name, uint _value) public {
        require (msg.sender == judgeAddress);
        require (_value <= total);

        if (_value > liability) {
          uint256 surplus = _value.sub(liability);
          getToken().transfer(beneficiaryAddress, surplus);
          validatedLiability = validatedLiability.add(liability);
        } else {
          validatedLiability = validatedLiability.add(_value);
        }
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


    function getLiability() public view returns(uint256) {
        return liability;
    }


    function getValidatedLiability() public view returns(uint256) {
        return validatedLiability;
    }
}