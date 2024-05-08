# Using the Eth Validator

The Eth Validator Module can both work as a Secondary or as the Core Validator
for the account. It requires a separate SDK. In this section of the
documentation, you will see how you can use the Moduler Account to interact
with the Eth Validator Module.

- [Using the Eth Validator](#using-the-eth-validator)
  - [Interacting with a Contract](#interacting-with-a-contract)
  - [Interacting with the Stark Validator](#interacting-with-the-stark-validator)
    - [Getting the stark validator module class hash](#getting-the-stark-validator-module-class-hash)
    - [Check the module is installed on the account](#check-the-module-is-installed-on-the-account)
    - [Calling views functions in the module](#calling-views-functions-in-the-module)
    - [Executing external functions in the module](#executing-external-functions-in-the-module)
  - [Interacting with a Contract with the new registered key](#interacting-with-a-contract-with-the-new-registered-key)

> Note: This section assumes the `SmartrAccount` class has been instantiated
> in the `smartrAccount` variable as shown in
> [Using the modular account from the SDK](./SDKS-DEPLOYMENT.md#using-the-modular-account-from-the-sdk).
> It also assumes the `Counter` contract that comes with the project has been
> deploys to the `counterAddress` and the `CounterABI` class is available. The
> `05-setup.ts` script that comes with this project ensure those steps are
> executed.

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

## Interacting with the Stark Validator

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
```
