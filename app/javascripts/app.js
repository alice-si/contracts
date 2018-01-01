// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import alice_token_artifacts from '../../build/contracts/AliceToken.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var AliceToken = contract(alice_token_artifacts);

var accounts;
var aliceAccount;
var donor1Account;
var donor2Account;
var beneficiaryAccount;
var judgeAccount;

var TokenContract;
var CharityContract;
var ImpactContract;

var balances = {};

function refreshBalance() {
  showBalance(donor1Account,  "balance_donor_1");
  showBalance(donor2Account,  "balance_donor_2");
  //showBalance(CharityContract.address, "balance_charity");
  showBalance(beneficiaryAccount, "balance_beneficiary");
}

function showBalance(account, element) {
  TokenContract.balanceOf(account).then(function(value) {
    var balance_element = document.getElementById(element);
    balance_element.innerHTML = value.valueOf();
    balances[account] = value;
  });
}

function showAllImpacts() {
  showImpact('Tenancy');
  showImpact('Employment');
}

function showImpact(name) {
  ImpactContract.getImpactCount.call(name).then(function(c) {
    var count = c.valueOf();
    console.log(name + ' impact: ' + count);
    for(var i=0; i < count; i++) {
      (function(index) {
        ImpactContract.getImpactDonor.call(name, i).then(function (address) {
          console.log(name + ' address[' + index + ']: ' + address);
          ImpactContract.getImpactValue.call(name, address).then(function (value) {
            console.log(name + ' value[' + index + ']: ' + value);
          });
        });        
      })(i);
    }
  });
}

window.donate = function(account, value) {
  // TokenContract.mint(CharityContract.address, value, {from: aliceAccount, gas: 1000000}).then(function(tx) {
  //   return CharityContract.notify(account, value, {from: aliceAccount, gas: 1000000})
  // .then(function () {
  //     refreshBalance();
  //     return null;
  //   });
  // })
	TokenContract.mint(account, value, {from: aliceAccount, gas: 1000000}).then(function(tx) {
		 refreshBalance();
		});
}

function reuseUnspent(account) {
  TokenContract.transfer(CharityContract.address, balances[account], {from: account, gas: 1000000})
    .then(function(tx) {
      return CharityContract.notify(account, balances[account], {from: aliceAccount, gas: 1000000})
    .then(function () {
      console.log("Donated remaining funds: " + balances[account]);
      refreshBalance();
      return null;
    });
  });
}

function validateOutcome(name, value) {
  return CharityContract.unlockOutcome(name, value, {from: judgeAccount, gas: 500000}).then(function() {
    console.log("Validating outcome: " + name + " valued at: " + value);
    refreshBalance();
    showAllImpacts();
    return linkImpact(name, value);
  });
}

function payBackAll() {
  payBack(donor1Account);
  payBack(donor2Account);
}

function payBack(account) {
  CharityContract.payBack(account, {from: aliceAccount, gas: 1000000}).then(function() {
    console.log("Payback done");
    refreshBalance();
    return null;
  });
}

function linkImpact(name, outcomeValue) {
  return ImpactContract.getImpactLinked.call(name, {from: aliceAccount}).then(function(val) {
    console.log("Linked: " + val + " of: " + outcomeValue);
    if (val < outcomeValue) {
      console.log("Linking impact: " + val + " of: " + outcomeValue);
      return ImpactContract.linkImpact(name, {from: aliceAccount, gas: 2000000}).then(function(tx) {
        return linkImpact(name, outcomeValue);
      });
    }
  });
}

function mapAccounts(accounts) {
  aliceAccount = accounts[0];
  judgeAccount = accounts[1];
  beneficiaryAccount = accounts[2];
  donor1Account = accounts[3];
  donor2Account = accounts[4];

  window.donor1Account = donor1Account;
  window.donor2Account = donor2Account;
}

function printLog(text) {
	var logBox = document.getElementById("log");
	logBox.innerHTML += text + "<br/>";
}

function printTx(tx) {
	printLog("Transaction hash: " + tx);
}

function printContract(contract) {
  printLog("Contract " + " deployed to: " + contract.address);
}

function setupWeb3Filter() {
  var filter = web3.eth.filter({});

  filter.watch(function (error, log) {
    console.log(log);
    printTx(log.transactionHash);
  });
}

async function deployToken() {
	AliceToken.setProvider(web3.currentProvider);

  TokenContract = await AliceToken.new({from: aliceAccount, gas: 2000000});
  printContract(TokenContract);
	refreshBalance();
}

window.onload = function() {
	window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));


	web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      mapAccounts(accs);
		  deployToken();

    });
	setupWeb3Filter();

};
