# Using the P256 Validator

The Eth Validator Module can both work as a Secondary or as the Core Validator
for the account. It requires a separate SDK. In this section of the
documentation, you will see how you can use the Moduler Account to interact
with the Eth Validator Module.

- [Using the P256 Validator](#using-the-p256-validator)
  - [Installing the Eth Validator SDK](#installing-the-eth-validator-sdk)
  - [Declaring the Eth Validator](#declaring-the-eth-validator)
  - [Verify the Eth Validator class hash](#verify-the-eth-validator-class-hash)
  - [Using the Eth Validator as a Secondary Validator](#using-the-eth-validator-as-a-secondary-validator)
    - [Register the Eth Validator as a Module](#register-the-eth-validator-as-a-module)
    - [Register the public key associated with your Eth Private Key](#register-the-public-key-associated-with-your-eth-private-key)
    - [Run a transaction with the EthModule](#run-a-transaction-with-the-ethmodule)
    - [Remove the Eth Validator Module](#remove-the-eth-validator-module)
  - [Using the Eth Validator as the Core Validator](#using-the-eth-validator-as-the-core-validator)
    - [Compute the Public Key as an Array of felt252](#compute-the-public-key-as-an-array-of-felt252)
    - [Compute the Account Address](#compute-the-account-address)
    - [Send ETH to the SmartrAccount Address to deploy it](#send-eth-to-the-smartraccount-address-to-deploy-it)
    - [Deploy the Account with the Eth Validator as Core](#deploy-the-account-with-the-eth-validator-as-core)
    - [The Script Code](#the-script-code)
  - [Running a transaction with the Eth Validator as Core](#running-a-transaction-with-the-eth-validator-as-core)

> Note: This section assumes the `SmartrAccount` class has been instantiated
> in the `smartrAccount` variable as shown in
> [Using the modular account from the SDK](./SDKS-DEPLOYMENT.md#using-the-modular-account-from-the-sdk).
> It also assumes the `Counter` contract that comes with the project has been
> deploys to the `counterAddress` and the `CounterABI` class is available. The
> `05-setup.ts` script that comes with this project ensure those steps are
> executed.

## Installing the Eth Validator SDK

If you plan to use the Eth Validatoi module, you might need the
`@0xknwn/starknet-module` SDK in addition to the
`@0xknwn/starknet-modular-account` SDK. To install it, run:

```shell
npm install --save \
  @0xknwn/starknet-module
```

## Declaring the Eth Validator

If you are working on a network that does not have the eth validator class
already declared, you will need to declare it. The Eth validator module SDK, aka
`@0xknwn/starknet-module` contains a helper function named `declareClass` to
declare the class to the network. To use it, you need to pass:

- A starknet.js `Account` as a first parameter
- The name of the class to declare as the 2nd parameter. For the Eth Validator,
  the name is`EthValidator`

Below is an example of a script that declares the new classes.

```typescript
{{#include ../experiments/documentation-examples/src/04-declare-eth-validator.ts}}
```

> Note: To declare the class, the account you use must be loaded with ETH.

Assuming you have named the script `src/04-declare-eth-validator.ts`, transpile and run
it:

```shell
npx tsc --build

node dist/04-declare-eth-validator.js
```

The output should return the hash for the class.

## Verify the Eth Validator class hash

The class hash does **NOT** depend on the deployment or the network. So you
can find them at any time with the `classHash` helper that comes with the
SDK. The script below shows how to use that function:

```typescript
{{#include ../experiments/documentation-examples/src/04-check-eth-validator.ts}}
```

Transpile and run the script:

```shell
npx tsc --build

node dist/04-check-eth-validator.js
```

## Using the Eth Validator as a Secondary Validator

The simplest way to use the Eth Validator is to add it as a module to an
existing account and execute a transaction with the `EthModule` class from
the `@0xknwn/starknet-module`. 

### Register the Eth Validator as a Module

The modular account SDK comes with the `addModule`, `removeModule` and
`isModule`. You can use those 3 functions to manage the module in the account
once it has been declared to the network. To register the module in the account,
use `addModule`:

```typescript
{{#include ../experiments/documentation-examples/src/04-add-module.ts}}
```

Transpile and run the script:

```shell
npx tsc --build

node dist/04-add-module.js
```

### Register the public key associated with your Eth Private Key

Every module comes with a set of Management API. In the case of the Eth
Validator, the associated interfaces are the following:

```rust
#[starknet::interface]
pub trait IPublicKey<TState> {
    fn set_public_key(ref self: TState, new_public_key: EthPublicKey);
    fn get_public_key(self: @TState) -> EthPublicKey;
}
```

Now that you have installed the module, you can create an ETH private key and
register the associated public key in the module. For the purpose of the
demonstration, we will use an arbitrary (and now **unsafe**) private/public
key pair:

- private key: 0xb28ebb20fb1015da6e6367d1b5dba9b52862a06dbb3a4022e4749b6987ac1bd2
- public key:
  - x: 0xd31cf702f5c89d49c567dcfd568bc4869e343506749f69d849eb408802cfa646
  - y: 0x348c7bbf341964c306669365292c0066c23a2fedd131907534677aa3e22db2fc

Because Starknet types can only manage felt252 that are smaller than uint256
the format used by `EthPublicKey` is actually an `array<felt252>` that is made 
of `[x.low, x.high, y.low, y.high]`. To register the public key, use the
script below:

```typescript
{{#include ../experiments/documentation-examples/src/04-register-publickey.ts}}
```

Transpile and run the script:

```shell
npx tsc --build

node dist/04-register-publickey.js
```

You can check the public key is correctly registered with the script below:

```typescript
{{#include ../experiments/documentation-examples/src/04-get-publickey.ts}}
```

Transpile and run the script:

```shell
npx tsc --build

node dist/04-get-publickey.js
```

### Run a transaction with the EthModule

The `EthModule` is an implementation of a module that can be passed to
the `SmartrAccount` and manages the decoration of the transaction under the
hood. To fully instantiate that module, you will need:

- to instantiate the `EthModule` module from the SDK
- to use the `EthSigner` provided by Starknet.js with the Private Key
- to instantiate the `SmartrAccount` with the 2 classes above

Then you can run a transaction, exactly as you would do with any Starknet.js
account. The example below execute the `increment` entrypoint on the `Counter`
contract:

```typescript
{{#include ../experiments/documentation-examples/src/04-execute-tx.ts}}
```

Transpile and run the script:

```shell
npx tsc --build

node dist/04-execute-tx.js
```

### Remove the Eth Validator Module

You can use `removeModule` and `isModule` to remove the module from the account
with the script below:

```typescript
{{#include ../experiments/documentation-examples/src/04-remove-module.ts}}
```

Transpile and run the script:

```shell
npx tsc --build

node dist/04-remove-module.js
```

## Using the Eth Validator as the Core Validator

You can also use the Eth Validator as a Core Validator for the account. For that
purpose you will deploy a new account and use the EthSigner to validate the
account deployment **without** registering the `EthModule` in the
`SmartrAccount`. In order to proceed you need to:

- Generate the public key as an Array of felt252
- Compute the account address
- Send ETH to the modular account address
- Deploy the Account

### Compute the Public Key as an Array of felt252

The EthSigner helps to generate the public key from the private key. Once you
have the public key you should slice to get an array of 4 pieces like below:

```typescript
const signer = new EthSigner(ethPrivateKey);
const publicKey = await signer.getPubKey();
const coords = publicKey.slice(2, publicKey.length);
const x = coords.slice(0, 64);
const x_felts = cairo.uint256(`0x${x}`);
const y = coords.slice(64, 128);
const y_felts = cairo.uint256(`0x${y}`);
const publicKeyArray = [
  x_felts.low.toString(),
  x_felts.high.toString(),
  y_felts.low.toString(),
  y_felts.high.toString(),
];
```

### Compute the Account Address

Once you have the public key, you should use the `accountAddress` function from 
`@0xknwn/starknet-modular-account` to compute the address of the account you
will install. As a Salt, we will use the `hash.computeHashOnElements` from
the public key like below:

```typescript
const publicKeyHash = hash.computeHashOnElements(publicKeyArray);
const computedAccountAddress = accountAddress(
  "SmartrAccount",
  publicKeyHash,
  [ethClassHash("EthValidator"), "0x4", ...publicKeyArray]
);
```

> Note: The "0x4" that is inserted in the calldata is here to indicate there are
> 4 pieces to the publci key:

### Send ETH to the SmartrAccount Address to deploy it

To deploy the account, you need to have ETH associated with the target account
address. Assuming you have access to an account with ETH, this is how you send
eth to the `computedAccountAddress`:

```typescript
const account = new SmartrAccount(
  provider,
  ozAccountAddress,
  smartrAccountPrivateKey
);
const ETH = new Contract(ERC20ABI, ethAddress, account);
const initial_EthTransfer = cairo.uint256(5n * 10n ** 15n);
const call = ETH.populate("transfer", {
  recipient: computedAccountAddress,
  amount: initial_EthTransfer,
});
const { transaction_hash } = await account.execute(call);
const output = await account.waitForTransaction(transaction_hash);
```

### Deploy the Account with the Eth Validator as Core

To deploy the account, you will need to use the `deployAccount` helper function
from `@0xknwn/starknet-modular-account` with a `SmartrAccount` that has been
instantiated with a `EthSigner` like below:

```typescript
const ethSmartrSigner = new EthSigner(smartrAccountPrivateKey);
const ethAccount = new SmartrAccount(
  provider,
  computedAccountAddress,
  ethSmartrSigner
);
const address = await deployAccount(
  ethAccount,
  "SmartrAccount",
  publicKeyHash,
  [ethClassHash("EthValidator"), "0x4", ...publicKeyArray]
);
```

### The Script Code

You will find below the whole script that does the account deployment:

```typescript
{{#include ../experiments/documentation-examples/src/04-deploy-account.ts}}
```

Transpile and run it:

```shell
npx tsc --build

node dist/04-deploy-account.js
```

## Running a transaction with the Eth Validator as Core

Running a transaction with the EthValidator as a Core is no more complex than
running a transaction on a regular account. All you need to do is

- get the account address that could have been saved from earlier
- instantiate the `SmartrAccount` with the Starknet.js EthSigner
- execute the transaction

Below is an example that assumes you have deployed the account with the
`04-deploy-account.ts` script earlier:

```typescript
{{#include ../experiments/documentation-examples/src/04-execute-tx-core.ts}}
```

Transpile and run it:

```shell
npx tsc --build

node dist/04-execute-tx-core.js
```

As you can see from the script:

- You do not need the `EthModule` to interact with the account. That is because
  the validator is used as a Core Validator and, as such, the transaction does
  not required to be prefixed
- Running transactions is the same as running a transaction with the Stark
  validator. Only the signature changes.
