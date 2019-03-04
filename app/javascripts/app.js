// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import alice_token_artifacts from '../../build/contracts/AliceToken.json';
import wallet_artifacts from '../../build/contracts/DonationWallet.json';
import project_with_bonds_artifacts from '../../build/contracts/ProjectWithBonds.json';
import catalog_artifacts from '../../build/contracts/ProjectCatalog.json';
import impact_registry_artifacts from '../../build/contracts/ImpactRegistry.json';
import linker_artifacts from '../../build/contracts/FlexibleImpactLinker.json';
import investor_artifacts from '../../build/contracts/InvestmentWallet.json';
import coupon_artifacts from '../../build/contracts/Coupon.json';

// MetaCoin is our usable abstraction, which we'll use through the code below.
var AliceToken = contract(alice_token_artifacts);
var Wallet = contract(wallet_artifacts);
var ProjectWithBonds = contract(project_with_bonds_artifacts);
var Catalog = contract(catalog_artifacts);
var ImpactRegistry = contract(impact_registry_artifacts);
var Linker = contract(linker_artifacts);
var Investor = contract(investor_artifacts);
var Coupon = contract(coupon_artifacts);

const PROJECT_NAME = "DEMO_PROJECT";

var accounts;
var aliceAccount;
var donor1Account;
var donor2Account;
var beneficiaryAccount;
var validatorAccount;

var TokenContract;
var CharityContract;
var ImpactContract;
var CatalogContract;
var ProjectContract;
var InvestorContract;
var CouponContract;

var balances = {};
var wallets = {};

function refreshBalance() {
  showBalance(wallets[donor1Account].address,  "balance_donor_1");
  showBalance(wallets[donor2Account].address,  "balance_donor_2");
  showBalance(InvestorContract.address,  "balance_investor");
	showProjectTotal("balance_charity");
  showBalance(beneficiaryAccount, "balance_beneficiary");
  showCoupons(InvestorContract.address, "coupons");
  showLiability("liability");
}

function showBalance(account, element) {
	TokenContract.balanceOf(account).then(function(value) {
		lazyValueUpdate(element, value.valueOf());
    balances[account] = value;
  });
}

function showCoupons(account, element) {
	CouponContract.balanceOf(account).then(function(value) {
		lazyValueUpdate(element, value.valueOf());
	});
}

function showProjectTotal(element) {
	ProjectContract.total().then(function(total) {
		lazyValueUpdate(element, total.valueOf());
	});
}

function showLiability(element) {
	ProjectContract.getLiability().then(function(liability) {
		ProjectContract.getValidatedLiability().then(function(validated) {
			var value = liability.valueOf() + " LHC ( " + validated.valueOf() + " validated )";
			lazyValueUpdate(element, value);
		});
	});
}

function lazyValueUpdate(element, value) {
	var balance_element = document.getElementById(element);
	if (balance_element.innerHTML !== value.valueOf()) {
		balance_element.innerHTML = value.valueOf();
	}
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

function setTriggersForElementsWithChangeableAmounts() {
	$('.amount-changeable').on('DOMSubtreeModified', function(event) {
		blinkElement($(event.currentTarget));
	});
}

function blinkElement(el) {
	var timeout = 70;
	// Wait till all events (like animation) on the element finish
	el.promise().done(function() {
		el.off('DOMSubtreeModified'); // disable trigger for current element to avoid double blinking
		var startFontSize = el.css('font-size');
		var increasedFontSize = parseInt(startFontSize) * 1.2 + 'px';
    el.animate({
			"font-size": increasedFontSize
		}, timeout, function () {
			el.animate({
				"font-size": startFontSize
			}, timeout, function () {
				el.on('DOMSubtreeModified', function () {
					blinkElement(el); // enable blinking handler for element again
				})
			});
		});
	});
}

window.deposit = function(account, value) {
  TokenContract.mint(wallets[account].address, value, {from: aliceAccount, gas: 1000000}).then(function(tx) {
		 refreshBalance();
		 printTx("Deposit", tx);
		});
};

window.depositToInvestor = function(value) {
	TokenContract.mint(InvestorContract.address, value, {from: aliceAccount, gas: 1000000}).then(function(tx) {
		refreshBalance();
		printTx("Investor deposit", tx);
	});
};

window.donate = async function(account, value) {
	wallets[account].donate(value, PROJECT_NAME, {from: aliceAccount, gas: 1000000}).then(function(tx) {
	 	refreshBalance();
	 	printTx("Donation", tx);
	});
};

window.invest = async function(value) {
	InvestorContract.invest(value, PROJECT_NAME, {from: aliceAccount, gas: 1000000}).then(function(tx) {
		refreshBalance();
		printTx("Investment", tx);
	});
};

window.redeem = async function(value) {
	InvestorContract.redeemCoupons(value, PROJECT_NAME, {from: aliceAccount, gas: 1000000}).then(function(tx) {
		refreshBalance();
		printTx("Coupon redemption", tx);
	});
};

window.donateAll = async function(account) {
	var total = await TokenContract.balanceOf(wallets[account].address);
	donate(account, total.valueOf());
};

window.validateOutcome = async function(name, value) {
  var tx = await ProjectContract.validateOutcome(name, value, {from: validatorAccount, gas: 500000});
	printTx("Validation", tx);
  refreshBalance();
  return linkImpact(name);
};

window.payBack = async function(account) {
  var tx = await ProjectContract.payBack(wallets[account].address, {from: aliceAccount, gas: 1000000});
  refreshBalance();
	printTx("Pay back to account " + account , tx);
}

window.payBackAll = function() {
	payBack(donor1Account);
	payBack(donor2Account);
}

function linkImpact(name) {
  return ImpactContract.getImpactUnmatchedValue.call(name, {from: aliceAccount}).then(function(val) {
    console.log("Unlinked: " + val);
    if (val > 0) {
      console.log("Linking impact");
      return ImpactContract.linkImpact(name, {from: aliceAccount, gas: 3000000}).then(function(tx) {
        return linkImpact(name);
      });
    }
  });
}

function mapAccounts(accounts) {
  aliceAccount = accounts[0];
  validatorAccount = accounts[1];
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

function printTx(name, tx) {
	printLog(name + " transaction hash: " + tx.tx);
}

function printContract(name, contract) {
  printLog(name + " contract deployed to: " + contract.address);
}

// function setupWeb3Filter() {
//   var filter = web3.eth.filter({});
//
//   filter.watch(function (error, log) {
//     printTx(log.transactionHash);
//   });
// }

async function deployToken() {
	AliceToken.setProvider(web3.currentProvider);

  TokenContract = await AliceToken.new({from: aliceAccount, gas: 3000000});
  printContract("Token", TokenContract);
}

async function deployProject() {
	ProjectWithBonds.setProvider(web3.currentProvider);
	Catalog.setProvider(web3.currentProvider);
	ImpactRegistry.setProvider(web3.currentProvider);
	Linker.setProvider(web3.currentProvider);
	Coupon.setProvider(web3.currentProvider);

	ProjectContract = await ProjectWithBonds.new(PROJECT_NAME, 0, 100, 1000, {from: aliceAccount, gas: 5000000});
	printContract("Project", ProjectContract);
	CouponContract = Coupon.at(await ProjectContract.getCoupon({from: aliceAccount}));


	await ProjectContract.setValidator(validatorAccount, {from: aliceAccount, gas: 3000000});
	await ProjectContract.setBeneficiary(beneficiaryAccount, {from: aliceAccount, gas: 3000000});
	await ProjectContract.setToken(TokenContract.address, {from: aliceAccount, gas: 3000000});

	ImpactContract = await ImpactRegistry.new(ProjectContract.address, {from: aliceAccount, gas: 3000000});
	var linker = await Linker.new(ImpactContract.address, 10, {from: aliceAccount, gas: 3000000});
	await ImpactContract.setLinker(linker.address, {from: aliceAccount, gas: 3000000});

	await ProjectContract.setImpactRegistry(ImpactContract.address, {from: aliceAccount, gas: 3000000});

	CatalogContract = await Catalog.new({from: aliceAccount, gas: 3000000});
	printContract("Catalog", CatalogContract);

	await CatalogContract.addProject(PROJECT_NAME, ProjectContract.address, {from: aliceAccount, gas: 3000000});
}

async function deployWallet(donor) {
	Wallet.setProvider(web3.currentProvider);

	wallets[donor] = await Wallet.new(CatalogContract.address, {from: aliceAccount, gas: 3000000});
	printContract("Donor wallet", wallets[donor]);
}

async function deployInvestorWallet() {
	Investor.setProvider(web3.currentProvider);

	InvestorContract = await Investor.new(CatalogContract.address, {from: aliceAccount, gas: 3000000});
	printContract("Investor wallet", InvestorContract);
}

async function deploy() {
  await deployToken();
  await deployProject();
	await deployWallet(donor1Account);
	await deployWallet(donor2Account);
	await deployInvestorWallet();
	refreshBalance();
}

window.onload = function() {
	let ganacheUrl = "http://localhost:8545";
	if (process.env.NODE_ENV == 'production') {
		ganacheUrl = "http://ganache.demo.alice.si:80";
	}
	window.web3 = new Web3(new Web3.providers.HttpProvider(ganacheUrl));

	setTriggersForElementsWithChangeableAmounts();

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

		deploy();


	});


};
