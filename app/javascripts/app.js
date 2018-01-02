// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import alice_token_artifacts from '../../build/contracts/AliceToken.json';
import wallet_artifacts from '../../build/contracts/DonationWallet.json';
import project_artifacts from '../../build/contracts/Project.json';
import catalog_artifacts from '../../build/contracts/ProjectCatalog.json';
import impact_registry_artifacts from '../../build/contracts/ImpactRegistry.json';

// MetaCoin is our usable abstraction, which we'll use through the code below.
var AliceToken = contract(alice_token_artifacts);
var Wallet = contract(wallet_artifacts);
var Project = contract(project_artifacts);
var Catalog = contract(catalog_artifacts);
var ImpactRegistry = contract(impact_registry_artifacts);

const PROJECT_NAME = "DEMO_PROJECT";

var accounts;
var aliceAccount;
var donor1Account;
var donor2Account;
var beneficiaryAccount;
var judgeAccount;

var TokenContract;
var CharityContract;
var ImpactContract;
var CatalogContract;
var ProjectContract;

var balances = {};
var wallets = {};

function refreshBalance() {
  showBalance(wallets[donor1Account].address,  "balance_donor_1");
  showBalance(wallets[donor2Account].address,  "balance_donor_2");
  showBalance(ProjectContract.address, "balance_charity");
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

window.deposit = function(account, value) {
  TokenContract.mint(wallets[account].address, value, {from: aliceAccount, gas: 1000000}).then(function(tx) {
		 refreshBalance();
		});
};

window.donate = async function(account, value) {
	//var a = await wallets[account].getPC({from: aliceAccount, gas: 1000000});
	//console.log(a);
	wallets[account].donate(TokenContract.address, value, PROJECT_NAME, {from: aliceAccount, gas: 1000000}).then(function(tx) {
	 	refreshBalance();
	});
};

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
}

async function deployProject() {
	Project.setProvider(web3.currentProvider);
	Catalog.setProvider(web3.currentProvider);
	ImpactRegistry.setProvider(web3.currentProvider);

	ProjectContract = await Project.new(PROJECT_NAME, {from: aliceAccount, gas: 2000000});
	printContract(ProjectContract);

	var registry = await ImpactRegistry.new(ProjectContract.address, {from: aliceAccount, gas: 2000000});
	await ProjectContract.setImpactRegistry(registry.address, {from: aliceAccount, gas: 2000000});

	CatalogContract = await Catalog.new({from: aliceAccount, gas: 2000000});
	printContract(CatalogContract);

	await CatalogContract.addProject(PROJECT_NAME, ProjectContract.address, {from: aliceAccount, gas: 2000000});
}

async function deployWallet(donor) {
	Wallet.setProvider(web3.currentProvider);

	wallets[donor] = await Wallet.new(CatalogContract.address, {from: aliceAccount, gas: 2000000});
	printContract(wallets[donor]);
}

async function deploy() {
  await deployToken();
  await deployProject();
  await deployWallet(donor1Account);
  await deployWallet(donor2Account);
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

		  setupWeb3Filter();

      mapAccounts(accs);

      deploy();


    });


};
