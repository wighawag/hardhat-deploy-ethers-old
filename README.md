[![npm](https://img.shields.io/npm/v/@nomiclabs/buidler-ethers.svg)](https://www.npmjs.com/package/@nomiclabs/buidler-ethers)
[![buidler](https://buidler.dev/buidler-plugin-badge.svg?1)](https://buidler.dev)

# buidler-ethers-v5

[Buidler](http://getbuidler.com) plugin for integration with [ethers.js](https://github.com/ethers-io/ethers.js/) version 5.

## What

This plugin brings to Buidler the Ethereum library `ethers.js`, version 5, which allows you to interact with the Ethereum blockchain in a simple way.

it is in based on the existing effort by @nomicalbas : `@nomiclabas/buidler-ethers`

## Installation

```bash
npm install --save-dev buidler-ethers-v5 ethers@next
```

And add the following statement to your `buidler.config.js`:

```js
usePlugin("buidler-ethers-v5");
```

## Tasks

This plugin creates no additional tasks.

## Environment extensions

This plugins adds an `ethers` object to the Buidler Runtime Environment.

This object has add some extra Buidler-specific functionality.
But contrary to `@nomiclabas/buidler-ethers` it does not add ethers field that can already be accessed via the ethers library itself as import

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
```

The `Contract`s and `ContractFactory`s returned by these helpers are connected to the first signer returned by `getSigners` be default.

## Usage

There are no additional steps you need to take for this plugin to work.

Install it and access ethers through the Buidler Runtime Environment anywhere you need it (tasks, scripts, tests, etc). For example, in your `buidler.config.js`:

It also automatically integrate with the `buidler-deploy` plugin if detected 

```js
...
const contract await bre.ethers.getContract('<deploymentName>');
...
```


## TypeScript support

You need to add this to your `tsconfig.json`'s `files` array: `"node_modules/buidler-ethers-v5/src/type-extensions.d.ts"`
