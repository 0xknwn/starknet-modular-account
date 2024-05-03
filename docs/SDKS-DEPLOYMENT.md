# Deploying the Modular Account

- [Deploying the Modular Account](#deploying-the-modular-account)
  - [Declare a the SmartrAccount and CoreValidator classes](#declare-a-the-smartraccount-and-corevalidator-classes)
  - [Verify the SmartrAccount and CoreValidator class hash](#verify-the-smartraccount-and-corevalidator-class-hash)
  - [Charge ETH to the SmartrAccount Address to deploy it](#charge-eth-to-the-smartraccount-address-to-deploy-it)
  - [Deploy the Modular Account](#deploy-the-modular-account)
  - [Using the modular account from the SDK](#using-the-modular-account-from-the-sdk)

## Declare a the SmartrAccount and CoreValidator classes

If you are working on a network that does not have the classes already
declared, you will need to declare them. The modular account main SDK, aka
`@0xknwn/starknet-modular-account` contains class and a helper function named
`declareClass` to declare the class to the network. To use it, you need to
pass:

- A starknet.js `Account` as a first parameter
- The name of the class to declare as the 2nd parameter. They are
  `SmartrAccount` for the modular account and `CoreValidator` for the Stark
  Core Validator

Below is an example of a script that declares the 2 classes.

```typescript
{{#include ../experiments/documentation-examples/src/01-declare-class.ts}}
```

> Note: To declare the class, the account you use must be loaded with ETH.

Assuming you have named the script `src/deploy-class.ts`, to transpile it and
run it, use the script below:

```shell
npx tsc --build

node dist/01-declare-class.js
```

The output should return the classHash for the 2 classes.

## Verify the SmartrAccount and CoreValidator class hash

The 2 class hash do **NOT** depend on the deployment or the network. So you
can find them at any time with the `classHash` helper that comes with the
SDK. The script below shows how to use that function:

```typescript
{{#include ../experiments/documentation-examples/src/01-check-class.ts}}
```

Assuming you have named the script `src/check-class.ts`, to transpile it and
run it, use the script below:

```shell
npx tsc --build

node dist/01-check-class.js
```

## Charge ETH to the SmartrAccount Address to deploy it

Here again, the SDK provides a helper function called `deployAccount` to
help with the deployment of the modular account. Before you move forward with
the account, you must compute the account address with `accountAddress` and 
send ETH to it. To proceed, create a file named `src/load-eth.ts` like below:

```typescript
{{#include ../experiments/documentation-examples/src/01-load-eth.ts}}
```

> Note: You must create a file `abi/ERC20.ts` that contains the ABI of an ERC20
> in order to call it from a contract.

Assuming you have named the script `src/load-eth.ts`, to transpile it and
run it, use the script below:

```shell
npx tsc --build

node dist/01-load-eth.js
```

The output should return the yet to come account address...

## Deploy the Modular Account

Now that the address has some ETH on it, you can deploy the account with the
`deployAccount` helper. Create a file named `src/deploy-account.ts` like below:

```typescript
{{#include ../experiments/documentation-examples/src/01-deploy-account.ts}}
```

Assuming you have named the script `src/deploy-account.ts`, to transpile it and
run it, use the script below:

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

Assuming you have named the script `src/using-account.ts`, to transpile it and
run it, use the script below:

```shell
npx tsc --build

node dist/01-using-account.js
```
