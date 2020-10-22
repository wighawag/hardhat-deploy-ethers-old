[![hardhat](https://hardhat.org/hardhat-plugin-badge.svg?1)](https://hardhat.org)

# hardhat-deploy-ethers

[Hardhat](https://hardhat.org) plugin for integration with [ethers.js](https://github.com/ethers-io/ethers.js/).

## What

This plugin brings to Hardhat the Ethereum library `ethers.js`, which allows you to interact with the Ethereum blockchain in a simple way.

it is in based on the existing effort by @nomicalbas : `@nomiclabas/hardhat-ethers`
And add extra functionality and the ability to get signer from address string

## Installation

```bash
npm install --save-dev hardhat-deploy-ethers ethers
```

And add the following statement to your `hardhat.config.ts`:

```ts
import "hardhat-deploy-ethers"
```

## Tasks

This plugin creates no additional tasks.

## Environment extensions

This plugins adds an `ethers` object to the Hardhat Runtime Environment.

This object has add some extra `hardhat-deploy` specific functionality.
<!-- But contrary to `@nomiclabas/hardhat-ethers` it does not add ethers field that can already be accessed via the ethers library itself as import -->

### Provider object

A `provider` field is added to `ethers`, which is an `ethers.providers.Provider`
automatically connected to the selected network.

### Helpers

These helpers are added to the `ethers` object:

```typescript
function getContractFactory(name: string, signer?: ethers.Signer | string): Promise<ethers.ContractFactory>;

function getContractFactory(abi: any[], bytecode: ethers.BytesLike, | string, signer?: ethers.Signer | string): Promise<ethers.ContractFactory>;

function getContractAt(nameOrAbi: string | any[], address: string, signer?: ethers.Signer | string): Promise<ethers.Contract>;

function getSigners() => Promise<ethers.Signer[]>;

function getSigner(address: string) => Promise<ethers.Signer>;

function getContract(deploymentName: string, signer?: ethers.Signer | string): Promise<ethers.Contract>;
function getContractOrNull(deploymentName: string, signer?: ethers.Signer | string): Promise<ethers.Contract | null>;
```

The `Contract`s and `ContractFactory`s returned by these helpers are connected to the first signer returned by `getSigners` be default.

## Usage

There are no additional steps you need to take for this plugin to work.

Install it and access ethers through the Hardhat Runtime Environment anywhere you need it (tasks, scripts, tests, etc). For example, in your `hardhat.config.js`:

It also automatically integrate with the `hardhat-deploy` plugin if detected 

```ts
const contract = await hre.ethers.getContract('<deploymentName>');
```

