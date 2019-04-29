# Alice Smart Contracts

This project is a collection of smart contracts used by Alice, a social impact platform built on Ethereum <https://alice.si>.

### :warning: This repo is deprecated :warning:
**Alice has moved all modules to a monorepo at [alice-si/monorepo](https://github.com/alice-si/monorepo). See you over there!**

### Overview

The first application launched by Alice uses smart contracts to implement a "pay for success" donation model, where donors only pay if the charitable projects they give to achieve their goals.

Each charity project encodes a list of "goals" that the charity aims to achieve, and each goal is assigned a price that the charity will receive if/when the goal is provably achieved.

Donors give to projects on the Alice platform using fiat, and the payment logic is implemented on the blockchain using a stablecoin token pegged to the value of their gift. When a donor sends money to a project, the corresponding amount of tokens is minted and credited by the Charity contract.  These tokens are held in escrow until a dedicated Validator confirms that an expected goal pursued by the charity has been achieved. Once this validation has been performed, the price assigned to the goal is then transferred to the charity's account. If the charity does not achieve any goals, outstanding tokens are unlocked and returned to donors. They can then be reused for future donations.

### Installation
This project requires [node-js](https://github.com/nodejs/node) runtime and uses [truffle](https://github.com/trufflesuite/truffle) as the Ethereum smart contract development framework.

In order to run it, install truffle first:

    npm install -g truffle

Then install all of the node-js dependencies

    npm install

Connection to blockchain node is defined in truffle.js:

    networks: {
        dev: {
          network_id: "*",
          gas: 4000000,
          host: 'localhost',
          port: '8545'
        }
    }

We recommend using popular Ethereum test client [ganache](https://www.npmjs.com/package/ganache-cli) as a default node:

    npm install -g ganache-cli

### Running tests

To run all of the smart contract tests, use the following truffle command in your console:

    truffle test

If you are using the testrpc client, remember to start it with a sufficient number of test accounts:

    ganache-cli -a 100

You can also use an automated test script instead of the previous two commands:

    yarn test

### Demo dApp

We created a demo dApp so you can interact and test the smart contracts in a visual environment rather than hacking console scripts. To run this mode, deploy the smart contracts to your blockchain network:

    truffle migrate

... and then launch a demo server:

    npm run dev

This demo dApp should be available at: http://localhost:8080/ and look like this:
![screenshot](https://s3.eu-west-2.amazonaws.com/alice-res/alice-dApp.png)

## Contributions

All comments and ideas for improvements and pull requests are welcomed. We want to improve the project based on feedback from the community.

## License

MIT License

Copyright (c) 2017 Alice Ltd. (Jakub Wojciechowski jakub@alice.si)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
