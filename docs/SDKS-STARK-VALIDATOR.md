# Using the Core Stark Module

The Stark Validator Module is the Core Validator for the account. It is used by
default by the modular account. It is currently referenced during the
installation and used to compute the account address.

> Note: This section assumes the `SmartrAccount` class has been instantiated
> in the `smartrAccount` variable as shown in
> [Using the modular account from the SDK](./SDKS-DEPLOYMENT.md#using-the-modular-account-from-the-sdk).
> It also assumes the `Counter` contract that comes with the project has been
> deploys to the `counterAddress` and the counter ABI available from the
> `./abi/Counter.ts` typescript.

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

To execute the script, make sure you have deployed the account and the counter
contract in the network and run the following commands:

```shell
npx tsc --build

node dist/02-execute-tx.ts
```

## Checking the Core Validator

## Using the Stark Validator API

## Calling views functions in the module

## Executing external functions in the module

