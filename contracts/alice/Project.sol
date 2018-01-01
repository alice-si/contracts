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

    /* This generates a public event on the blockchain that will notify clients */
    event OutcomeEvent(string id, uint value);
    event DonationEvent(address indexed from, uint value);

    function Charity(string _name) {
        name = _name;
    }

    function setJudge(address _judgeAddress) onlyOwner {
        judgeAddress = _judgeAddress;
    }

    function setBeneficiary(address _beneficiaryAddress) onlyOwner {
        beneficiaryAddress = _beneficiaryAddress;
    }

    function setImpactRegistry(address impactRegistryAddress) onlyOwner {
        IMPACT_REGISTRY_ADDRESS = impactRegistryAddress;
    }

    function setContractProvider(address _contractProvider) onlyOwner {
        CONTRACT_PROVIDER_ADDRESS = _contractProvider;
    }

    function notify(address _from, uint _amount) onlyOwner {
        registerDonation(_from, _amount);
    }

    function registerDonation(address _from, uint _amount) internal {
        total = total.add(_amount);
        ImpactRegistry(IMPACT_REGISTRY_ADDRESS).registerDonation(_from, _amount);
        DonationEvent(_from, _amount);
    }

    function donateFromWallet(ERC20 _token, uint _amount) {
        _token.transferFrom(msg.sender, address(this), _amount);
        registerDonation(msg.sender, _amount);
    }

    function fund(uint _value) onlyOwner {
        total = total.add(_value);
    }

    function unlockOutcome(string _name, uint _value) {
        require (msg.sender == judgeAddress);
        require (_value <= total);

        address tokenAddress = ContractProvider(CONTRACT_PROVIDER_ADDRESS).contracts("digitalGBP");
        ERC20(tokenAddress).transfer(beneficiaryAddress, _value);
        total = total.sub(_value);

        ImpactRegistry(IMPACT_REGISTRY_ADDRESS).registerOutcome(_name, _value);

        OutcomeEvent(_name, _value);
    }

    function payBack(address account) onlyOwner {
        uint balance = getBalance(account);
        if (balance > 0) {
            address tokenAddress = ContractProvider(CONTRACT_PROVIDER_ADDRESS).contracts("digitalGBP");
            ERC20(tokenAddress).transfer(account, balance);
            total = total.sub(accountBalances[account]);
            ImpactRegistry(IMPACT_REGISTRY_ADDRESS).payBack(account);
        }
    }

    function getBalance(address donor) constant returns(uint) {
        return ImpactRegistry(IMPACT_REGISTRY_ADDRESS).getBalance(donor);
    }

    /* Extra security measure to save funds in case of critical error or attack */
    function escape(address escapeAddress) onlyOwner {
        address tokenAddress = ContractProvider(CONTRACT_PROVIDER_ADDRESS).contracts("digitalGBP");
        ERC20(tokenAddress).transfer(escapeAddress, total);
        total = 0;
    }
}