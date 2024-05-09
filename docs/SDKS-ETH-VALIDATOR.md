# Using the Eth Validator

The Eth Validator Module can both work as a Secondary or as the Core Validator
for the account. It requires a separate SDK. In this section of the
documentation, you will see how you can use the Moduler Account to interact
with the Eth Validator Module.

- [Using the Eth Validator](#using-the-eth-validator)
  - [Installing the Eth Validator SDK](#installing-the-eth-validator-sdk)
  - [Declaring the Eth Validator](#declaring-the-eth-validator)
  - [Verify the Eth Validator class hash](#verify-the-eth-validator-class-hash)
  - [Using the Eth Validator as a Secondary Validator](#using-the-eth-validator-as-a-secondary-validator)
    - [Register the Eth Validator as a Module](#register-the-eth-validator-as-a-module)
    - [Register the public key associated with your Eth Private Key](#register-the-public-key-associated-with-your-eth-private-key)
    - [Run a transaction with the EthModule](#run-a-transaction-with-the-ethmodule)
    - [Remove the Eth Validator Module](#remove-the-eth-validator-module)
  - [Using the Eth Validator as the Core Validator](#using-the-eth-validator-as-the-core-validator)
    - [Compute the Account Address](#compute-the-account-address)
    - [Charge ETH to the SmartrAccount Address to deploy it](#charge-eth-to-the-smartraccount-address-to-deploy-it)
    - [Deploy the Account with the Eth Validator as Core](#deploy-the-account-with-the-eth-validator-as-core)
    - [Run a transaction with Eth Vaidator as Core](#run-a-transaction-with-eth-vaidator-as-core)

> Note: This section assumes the `SmartrAccount` class has been instantiated
> in the `smartrAccount` variable as shown in
> [Using the modular account from the SDK](./SDKS-DEPLOYMENT.md#using-the-modular-account-from-the-sdk).
> It also assumes the `Counter` contract that comes with the project has been
> deploys to the `counterAddress` and the `CounterABI` class is available. The
> `05-setup.ts` script that comes with this project ensure those steps are
> executed.

## Installing the Eth Validator SDK

If you plan to use the Eth Validatoi module, you might need the
`@0xknwn/starknet-module-eth` SDK in addition to the
`@0xknwn/starknet-modular-account` SDK. To install it, run:

```shell
npm install --save \
  @0xknwn/starknet-module-eth
```

## Declaring the Eth Validator

If you are working on a network that does not have the eth validator class
already declared, you will need to declare it. The Eth validator module SDK, aka
`@0xknwn/starknet-module-eth` contains a helper function named `declareClass` to
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
the `@0xknwn/starknet-module-eth`. 

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
account deployment.

### Compute the Account Address

### Charge ETH to the SmartrAccount Address to deploy it

### Deploy the Account with the Eth Validator as Core

### Run a transaction with Eth Vaidator as Core

<!--### Compute the Account Address

### Charge ETH to the SmartrAccount Address to deploy it

Here again, the SDK provides a helper function called `deployAccount` to
help with the deployment of the modular account. Before you move forward with
the account, you must compute the account address with `accountAddress` and 
send ETH to it. To proceed, create a file named `src/01-load-eth.ts` with this
content:

```typescript
{{#include ../experiments/documentation-examples/src/01-load-eth.ts}}
```

> Note: You must create a file `abi/ERC20.ts` that contains the ABI of an ERC20
> in order to call it from a contract. 

Transpile and run the script:

```shell
npx tsc --build

node dist/01-load-eth.js
```

## Deploy the Account with the Eth Validator as Core

Now that the address has some ETH on it, you can deploy the account with the
`deployAccount` helper. Create a file named `src/01-deploy-account.ts` like
below:

```typescript
{{#include ../experiments/documentation-examples/src/01-deploy-account.ts}}
```

Transpile and run the script:

```shell
npx tsc --build

node dist/01-deploy-account.js
```

## Using the modular account from the SDK

You can use rely on the `SmartrAccount` class to use the account. The script
below shows all the requirements to compute the class hash, the address and 
instantiate the account:

```typescript
{{#include ../experiments/documentation-examples/src/01-using-account.ts}}
```

Transpile and run the script:

```shell
npx tsc --build

node dist/01-using-account.js
```


 ## Interacting with a Contract

The starknet modular account SDK provides the `SmartrAccount` class that extends
the starknet.js Account class. As you can see from the script below, using the
`SmartrAccount` is exactly like using the `Account` class, you can:

- instantiate the account with an `RpcProvider`, an `address` and a `Signer` or
  private key
- use the account in a `Contract` to call view functions
- use the `execute` function of the account to call an external function of a
  contract. `SmartrAccount` provides the same methods as `Account`

```typescript
{{#include ../experiments/documentation-examples/src/02-execute-tx.ts}}
```

Transpile and run the script:

```shell
npx tsc --build

node dist/02-execute-tx.js
```

## Interacting with the Eth Validator

The `SmartrAccount` class, however, provides more than just the regular
`Account` class. It can interact with functions that are part of the module
and not part of the account. In the case of the Stark Validator, those
functions are:

```rust
fn get_public_keys(self: @TState) -> Array<felt252>;
fn add_public_key(ref self: TState, new_public_key: felt252);
fn remove_public_key(ref self: TState, old_public_key: felt252);
fn get_threshold(self: @TState) -> u8;
fn set_threshold(ref self: TState, new_threshold: u8);
```

To execute a function that is part of the module you need:

- to figure out the stark validator module class hash
- to check the module is installed on the account. That is something that is
  setup at the account deployment time
- to use one of `callOnModule` for view functions or `executeOnModule` for
  running transactions on the SmartrAccount.

The sections below dig into the details of these operations.

### Getting the stark validator module class hash

This is something we have already done previously. You can use
`classHash("CoreValidator")` afther your imported the `classHash` function from
`@0xknwn/starknet-modular-account` like below:

```typescript
{{#include ../experiments/documentation-examples/src/02-check-class.ts}}
```

To execute the script, make sure you have deployed the account in the network
and run the following commands:

```shell
npx tsc --build

node dist/02-check-class.js
```

### Check the module is installed on the account

The `SmartrAccount` provides a method `isModule` that can be used to know if
a module is installed with the account. 


```typescript
{{#include ../experiments/documentation-examples/src/02-module-installed.ts}}
```

Transpile and run the script:

```shell
npx tsc --build

node dist/02-module-installed.js
```

### Calling views functions in the module

To execute a view function on the module, we must build the argumemt list with
the `CallData` class. Thwn we can call the `callOnModule` function from
`SmartrAccount` with the module class hash, the function name and the calldata
like below:

```typescript
{{#include ../experiments/documentation-examples/src/02-registered-publickeys.ts}}
```

Transpile and run the script:

```shell
npx tsc --build

node dist/02-registered-publickeys.js
```

### Executing external functions in the module

To execute an external function on the module, we must build the argumemt list
with the `CallData` class. Then we can call the `executeOnModule` function from
`SmartrAccount` with the module class hash, the function name and the calldata
like below. Here we will register a second public key for the same account:

```typescript
{{#include ../experiments/documentation-examples/src/02-add-publickey.ts}}
```

Transpile and run the script:

```shell
npx tsc --build

node dist/02-add-publickey.js
```

You can re-run the script from the previous example to check the account has
two registered public key:

```shell
node dist/02-registered-publickeys.js
```

## Interacting with a Contract with the new registered key

You now can interact with the `SmartrAccount` with your second private key like
below:

```typescript
{{#include ../experiments/documentation-examples/src/02-execute-tx-pk2.ts}}
```

Transpile and run the script:

```shell
npx tsc --build

node dist/02-execute-tx-pk2.js
``` -->
