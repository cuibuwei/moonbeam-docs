---
title: Deploy a Contract
description: Learn how to deploy unmodified and unchanged Solidity-based smart contracts to a Moonbeam with a simple script using Ethers.js.
---

# Using Ethers.js to Deploy Smart Contracts on Moonbeam

## Introduction  
This guide walks you through the process of using the Solidity compiler and [ethers.js](https://docs.ethers.io/) to deploy and interact with a Solidity-based smart contract on a Moonbeam standalone node. Given Moonbeam’s Ethereum compatibility features, the ethers.js library can be used directly with a Moonbeam node.

The guide assumes that you have a local Moonbeam node running in `--dev` mode. You can find instructions to set up a local Moonbeam node [here](/getting-started/local-node/setting-up-a-node/).

!!! note
    This tutorial was created using the v3 release of [Moonbase Alpha](https://github.com/PureStake/moonbeam/releases/tag/v0.3.0). The Moonbeam platform, and the [Frontier](https://github.com/paritytech/frontier) components it relies on for Substrate-based Ethereum compatibility, are still under very active development. The examples in this guide assume an Ubuntu 18.04-based environment and will need to be adapted accordingly for MacOS or Windows.

## Checking Prerequisites
If you followed this [tutorial](/getting-started/local-node/setting-up-a-node/), you should have a standalone Moonbeam node producing blocks in your local environment, that looks like this:

![Moonbeam local node](/images/etherscontract/ethers-contract-1.png)

In addition, we need to install Node.js (we'll go for v15.x) and the npm package manager. You can do this by running in your terminal:

```
curl -sL https://deb.nodesource.com/setup_15.x | sudo -E bash -
```

```
sudo apt install -y nodejs
```

We can verify that everything installed correctly by querying the version for each package:

```
node -v
```

```
npm -v
```

As of the writing of this guide, versions used were 15.2.1 and 7.0.8, respectively.

Next, we can create a directory to store all our relevant files (in a separate path from the local Moonbeam node files) by running:

```
mkdir transaction && cd transaction/
```

And create a simple package.json file:

```
npm init --yes
```

With the package.json file created, we can then install the ethers.js library by executing:

```
npm install ethers
```

To verify the installed version of ethers.js, you can use the `ls` command:

```
npm ls ethers
```

As of the writing of this guide, the version used was 5.0.22.

Similarly to our [web3.js contract tutorial](/getting-started/local-node/web3-js/web3-contract/), we will use that setup for this example, so some files we'll look similar:

-  _Incrementer.sol_: the file with our Solidity code
-  _compile.js_: it will compile the contract with the Solidity compiler
-  _deploy.js_: it will handle the deployment to our local Moonbeam node
-  _get.js_: it will make a call to the node to get the current value of the number
-  _increment.js_: it will make a transaction to increment the number stored on the Moonbeam node
-  _reset.js_: the function to call that will reset the number stored to zero

## The Contract File and Compile Script
Even though we are using a different library, these two files remain identical. The first being the smart contract written in Solidity, and the second being the compile script, both of which do not require the web3.js or ethers.js libraries.

### The contract file
The contract we will use is a very simple incrementer (arbitrarily named _Incrementer.sol_, and which you can find [here](/code-snippets/web3-contract-local/Incrementer.sol)). The Solidity code is the following:

```solidity
--8<-- 'web3-contract-local/Incrementer.sol'
```

Our `constructor` function, that runs when the contract is deployed, sets the initial value of the number variable that is stored in the Moonbeam node (default is 0). The `increment` function adds `_value` provided to the current number, but a transaction needs to be sent as this modifies the stored data. And lastly, the `reset` function resets the stored value to zero.

!!! note
    This contract is just a simple example that does not handle values wrapping around, and it is only for illustration purposes.

    ### The compile file

The only purpose of the _compile.js_ file (arbitrarily named, and which you can find [here](/code-snippets/web3-contract-local/compile.js)), is to use the Solidity compiler to output the bytecode and interface of our contract.

First, we need to load the different modules that we will use for this process. The _path_ and _fs_ modules are included by default in Node.js (that is why we didn't have to install it before).

Next, we have to read the content of the Solidity file (in UTF8 encoding).

Then, we build the input object for the Solidity compiler.

And finally, we run the compiler and extract the data related to our incrementer contract because, for this simple example, that is all we need.

```javascript
--8<-- 'web3-contract-local/compile.js'
```

## The Deploy Script and Interacting with our Contract
In this section we will see some differences between libraries, but with the same end  result.

### The deploy file
The deployment file (which you can find [here](/code-snippets/ethers-contract-local/deploy.js)) is divided into two subsections: the initialization and the deploy contract.

First, we need to load our ethers.js module and the export of the _compile.js_ file, from which we will extract the `bytecode` and `abi`.

Next, define the `privKey` variable as the private key of our genesis account, which is where all the funds are stored when deploying your local Moonbeam node. Remember that in ethers.js we need to provide the prefix `0x`. In addition, we have to define the provider by passing in the standalone Moonbeam node RPC URL. Both of these will be used to create the `wallet` instance and access all its methods.

To deploy the contract, first we need to create a local instance using the `ethers.ContractFactory(abi, bytecode, wallet)`. Then, we can use the `deploy(args)` method of this local instance, which uses a signer to deploy the contract with the arguments passed into the constructor. This promise returns a contract that contains the address where it will be deployed once the transaction is processed.

```javascript
--8<-- 'ethers-contract-local/deploy.js'
```

!!! note
    The _deploy.js_ script provides the contract address as an output. This comes handy as it is used for the contract interaction files.

### Files to interact with the contract
In this section, we will quickly go over the files that interact with our contract, either by making calls or sending transactions to modify its storage

First, let's overview the _get.js_ file (the simplest of them all, which you can find [here](/code-snippets/ethers-contract-local/get.js)), that fetches the current value stored on the contract. We need to load our ethers.js module and the export of the _compile.js_ file, from which we will extract the `abi`. Next, we define the provider so we can access the methods necessary to call our contract

The following step is to create a local instance of the contract by using the `ethers.Contract(contractAddress, abi, provider)` command. The `contractAddress` is logged in the console by the _deploy.js_ file. This local instance is being defined with the `provider`, so only read-only methods are available. Then, wrapped in an async function, we can write the contract call by running `contractInstance.myMethods()`, where we set the method or function that we want to call and provide the inputs for this call. This promise returns the data that we can log in the console. And lastly, we run our `get` function.

```javascript
--8<-- 'ethers-contract-local/get.js'
```