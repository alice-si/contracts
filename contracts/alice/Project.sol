pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/token/ERC20.sol';

import "./impact/ImpactRegistry.sol";
import "../ContractProvider.sol";

contract Project is Ownable {
    using SafeMath for uint256;

    string public name;
    address public judgeAddress;
    address public beneficiaryAddress;
    address public IMPACT_REGISTRY_ADDRESS;
    address public CONTRACT_PROVIDER_ADDRESS;


    /* This creates a map with donations per user */
    mapping (address => uint) accountBalances;

    /* Additional structure to help to iterate over donations */
    address[] accountIndex;

    /* Total amount of all of the donations */
    uint public total;

    /* Token, currently we support a single token per project */
    ERC20 private token;


    /* This generates a public event on the blockchain that will notify clients */
    event OutcomeEvent(string id, uint value);
    event DonationEvent(address indexed from, uint value);

    function Project(string _name) public {
        name = _name;
    }

    function setJudge(address _judgeAddress) public onlyOwner {
        judgeAddress = _judgeAddress;
    }

    function setBeneficiary(address _beneficiaryAddress) public onlyOwner {
        beneficiaryAddress = _beneficiaryAddress;
    }

    function setImpactRegistry(address impactRegistryAddress) public onlyOwner {
        IMPACT_REGISTRY_ADDRESS = impactRegistryAddress;
    }

    function setContractProvider(address _contractProvider) public onlyOwner {
        CONTRACT_PROVIDER_ADDRESS = _contractProvider;
    }

    function setToken(ERC20 _token) public onlyOwner {
        token = _token;
    }

    function notify(address _from, uint _amount) public onlyOwner {
        registerDonation(_from, _amount);
    }

    function registerDonation(address _from, uint _amount) internal {
        total = total.add(_amount);
        ImpactRegistry(IMPACT_REGISTRY_ADDRESS).registerDonation(_from, _amount);
        DonationEvent(_from, _amount);
    }

    function donateFromWallet(uint _amount) public {
        getToken().transferFrom(msg.sender, address(this), _amount);
        registerDonation(msg.sender, _amount);
    }

    function fund(uint _value) public onlyOwner {
        total = total.add(_value);
    }

    function unlockOutcome(string _name, uint _value) public {
        require (msg.sender == judgeAddress);
        require (_value <= total);

        getToken().transfer(beneficiaryAddress, _value);
        total = total.sub(_value);

        ImpactRegistry(IMPACT_REGISTRY_ADDRESS).registerOutcome(_name, _value);

        OutcomeEvent(_name, _value);
    }

    function payBack(address account) public onlyOwner {
        uint balance = getBalance(account);
        if (balance > 0) {
            getToken().transfer(account, balance);
            total = total.sub(accountBalances[account]);
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

    function getToken() public view returns(ERC20) {
        return token;
    }
}