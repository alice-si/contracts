pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol';

import "./impact/ImpactRegistry.sol";
import "../ContractProvider.sol";
import "./ClaimsRegistry.sol";
import './StringUtils.sol';

contract Project is Ownable {
    using SafeMath for uint256;
    using StringUtils for string;

    string public name;
    address public validatorAddress;
    address public beneficiaryAddress;
    address public IMPACT_REGISTRY_ADDRESS;
    ClaimsRegistry public CLAIMS_REGISTRY;
    //A percentage of funds that is sent immediately to a charity
    uint8 public upfrontPaymentPercentage;


    /* Additional structure to help to iterate over donations */
    address[] accountIndex;

    /* Total amount of all of the donations */
    uint public total;

    /* Token, currently we support a single token per project */
    ERC20 private token;


    /* This generates a public event on the blockchain that will notify clients */
    event OutcomeEvent(string id, uint value);
    event DonationEvent(address indexed from, uint value);

    constructor(string _name, uint8 _upfrontPaymentPercentage) public {
        require(_upfrontPaymentPercentage >= 0 && _upfrontPaymentPercentage < 100);
        name = _name;
        upfrontPaymentPercentage = _upfrontPaymentPercentage;
    }

    function setValidator(address _validatorAddress) public onlyOwner {
        validatorAddress = _validatorAddress;
    }

    function setBeneficiary(address _beneficiaryAddress) public onlyOwner {
        beneficiaryAddress = _beneficiaryAddress;
    }

    function setImpactRegistry(address impactRegistryAddress) public onlyOwner {
        IMPACT_REGISTRY_ADDRESS = impactRegistryAddress;
    }

    function setClaimsRegistry(ClaimsRegistry _claimsRegistry) public onlyOwner {
        CLAIMS_REGISTRY = _claimsRegistry;
    }

    function setToken(ERC20 _token) public onlyOwner {
        token = _token;
    }

    function notify(address _from, uint _amount) public onlyOwner {
        require(_from != 0x0);
        require(_amount > 0);
        registerDonation(_from, _amount);
    }

    function registerDonation(address _from, uint _amount) internal {
        (uint256 upfront, uint256 remainder) = calculateUpfrontSplit(_amount);

        if (upfront > 0) {
            getToken().transfer(beneficiaryAddress, upfront);
        }

        total = total.add(remainder);
        ImpactRegistry(IMPACT_REGISTRY_ADDRESS).registerDonation(_from, remainder);

        emit DonationEvent(_from, _amount);
    }

    function donateFromWallet(uint _amount) public {
        getToken().transferFrom(msg.sender, address(this), _amount);
        registerDonation(msg.sender, _amount);
    }

    function fund(uint _value) public onlyOwner {
        total = total.add(_value);
    }

    function validateOutcome(string _name, uint _value) public {
        if (address(CLAIMS_REGISTRY) == 0x0) {
            require (msg.sender == validatorAddress);
        } else {
            require(CLAIMS_REGISTRY.getClaim(beneficiaryAddress, address(this), _name.stringToBytes32()) == bytes32(_value));
            require(CLAIMS_REGISTRY.isApproved(validatorAddress, beneficiaryAddress, address(this), _name.stringToBytes32()));
        }

        require (_value > 0 && _value <= total);

        getToken().transfer(beneficiaryAddress, _value);
        total = total.sub(_value);

        ImpactRegistry(IMPACT_REGISTRY_ADDRESS).registerOutcome(_name, _value);

        emit OutcomeEvent(_name, _value);
    }

    function payBack(address account) public onlyOwner {
        uint balance = getBalance(account);
        if (balance > 0) {
            getToken().transfer(account, balance);
            total = total.sub(balance);
            ImpactRegistry(IMPACT_REGISTRY_ADDRESS).payBack(account);
        }
    }

    function getBalance(address donor) public view returns(uint) {
        return ImpactRegistry(IMPACT_REGISTRY_ADDRESS).getBalance(donor);
    }

    /* Extra security measure to save funds in case of critical error or attack */
    function escape(address escapeAddress) public onlyOwner {
        getToken().transfer(escapeAddress, total);
        total = 0;
    }

    /**
    * Currently we don't fully support automatic processing of multiple crypto donation
    * but we can handle various tokens and convert them to our own stable coin on case by case basis
    */
    function reclaimAlternativeTokens(ERC20 _alternativeToken, address _targetAddress, uint256 _value) public onlyOwner {
        require(address(_alternativeToken) != 0x0, "Undefined ERC20 tokens");
        require(_alternativeToken.balanceOf(address(this)) >= _value, "Insufficient funds deposited on the contract");
        _alternativeToken.transfer(_targetAddress, _value);
    }

    function getToken() public view returns(ERC20) {
        return token;
    }

    function calculateUpfrontSplit(uint256 _amount) private view returns(uint256 upfront, uint256 remainder) {
        upfront = _amount.mul(upfrontPaymentPercentage).div(100);
        remainder = _amount.sub(upfront);
    }
}
