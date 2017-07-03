# Alice Smart Contracts

This project is a collection of smart contracts that are used by <https://alice.si>.

### Overview

Smart contracts implement a Pay for success donation model. After a donor sends money to the campaign, a corresponding amount of Alice Tokens are being generated and credited to the Charity contract. Tokens are held in an escrow and are released only if a dedicated Validator confirms that the expected outcome has been achieved. Tokens are moved to the Beneficiary account after the validation is performed. Any outstanding tokens may be returned to donors and reused for future donations.

### Installation
This project requires [node-js](https://github.com/nodejs/node) runtime and uses [truffle](https://github.com/trufflesuite/truffle) Ethereum smart contracts development framework. In order to run it, install truffle first:

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

We recommend using popular Ethereum test client [testrpc](https://github.com/ethereumjs/testrpc) as a default node:

    npm install -g ethereumjs-testrpc

### Running tests

To run all of the smart contract tests use following truffle command in your console:

    truffle test

If you are using testrpc client remember to start it with sufficient number of test accounts:

    testrpc -a 100

You can also use automated test script instead of the previous two commands:

    yarn test

### Demo dApp

We created a demo dApp so you can interact and test smart contract in a visual environment rather than hacking console scripts. To run this mode please deploy the smart contracts to your blockchain network:

    truffle migrate

... and then launch a demo server:

    truffle serve

This demo dApp should be available at: http://localhost:8080/ a look like that:
![screenshot](https://s3.eu-west-2.amazonaws.com/alice-res/alice-dApp.png)

## Contributions

All comments, ideas for improvements and pull requests are welcomed. We want to improve the project based on feedback from the community.

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