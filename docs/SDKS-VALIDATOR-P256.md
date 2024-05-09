# Using the P256 Validator

The P256 Validator Module can both work as a Secondary or as the Core Validator
for the account. It requires the module SDK. In this section of the
documentation, you will see how you can use the Modular Account to interact
with the P256 Validator Module.

- [Using the P256 Validator](#using-the-p256-validator)
  - [Installing the P256 Validator SDK](#installing-the-p256-validator-sdk)
  - [Declaring the P256 Validator](#declaring-the-p256-validator)
  - [Verify the P256 Validator class hash](#verify-the-p256-validator-class-hash)
  - [Using the P256 Validator as a Secondary Validator](#using-the-p256-validator-as-a-secondary-validator)
    - [Register the P256 Validator as a Module](#register-the-p256-validator-as-a-module)
    - [Register the public key associated with your P256 Private Key](#register-the-public-key-associated-with-your-p256-private-key)
    - [Run a transaction with the P256Module](#run-a-transaction-with-the-p256module)
    - [Remove the P256 Validator Module](#remove-the-p256-validator-module)
  - [Using the P256 Validator as the Core Validator](#using-the-p256-validator-as-the-core-validator)
    - [Compute the Public Key as an Array of felt252](#compute-the-public-key-as-an-array-of-felt252)
    - [Compute the Account Address](#compute-the-account-address)
    - [Send ETH to the SmartrAccount Address to deploy it](#send-eth-to-the-smartraccount-address-to-deploy-it)
    - [Deploy the Account with the P256 Validator as Core](#deploy-the-account-with-the-p256-validator-as-core)
    - [The Script Code](#the-script-code)
  - [Running a transaction with the P256 Validator as Core](#running-a-transaction-with-the-p256-validator-as-core)

> Note: This section assumes the `SmartrAccount` class has been instantiated
> in the `smartrAccount` variable as shown in
> [Using the modular account from the SDK](./SDKS-DEPLOYMENT.md#using-the-modular-account-from-the-sdk).
> It also assumes the `Counter` contract that comes with the project has been
> deploys to the `counterAddress` and the `CounterABI` class is available. The
> `05-setup.ts` script that comes with this project ensure those steps are
> executed.

## Installing the P256 Validator SDK

If you plan to use the P256 Validatoi module, you might need the
`@0xknwn/starknet-module` SDK in addition to the
`@0xknwn/starknet-modular-account` SDK. To install it, run:

```shell
npm install --save \
  @0xknwn/starknet-module
```

## Declaring the P256 Validator

If you are working on a network that does not have the P256 validator class
already declared, you will need to declare it. The P256 validator module SDK, aka
`@0xknwn/starknet-module` contains a helper function named `declareClass` to
declare the class to the network. To use it, you need to pass:

- A starknet.js `Account` as a first parameter
- The name of the class to declare as the 2nd parameter. For the P256 Validator,
  the name is`P256Validator`

Below is an example of a script that declares the new classes.

```typescript
{{#include ../experiments/documentation-examples/src/05-declare-p256-validator.ts}}
```

> Note: To declare the class, the account you use must be loaded with P256.

Assuming you have named the script `src/05-declare-p256-validator.ts`, transpile and run
it:

```shell
npx tsc --build

node dist/05-declare-p256-validator.js
```

The output should return the hash for the class.

## Verify the P256 Validator class hash

The class hash does **NOT** depend on the deployment or the network. So you
can find them at any time with the `classHash` helper that comes with the
SDK. The script below shows how to use that function:

```typescript
{{#include ../experiments/documentation-examples/src/05-check-p256-validator.ts}}
```

Transpile and run the script:

```shell
npx tsc --build

node dist/05-check-p256-validator.js
```

## Using the P256 Validator as a Secondary Validator

The simplest way to use the P256 Validator is to add it as a module to an
existing account and execute a transaction with the `P256Module` class from
the `@0xknwn/starknet-module`. 

### Register the P256 Validator as a Module

The modular account SDK comes with the `addModule`, `removeModule` and
`isModule`. You can use those 3 functions to manage the module in the account
once it has been declared to the network. To register the module in the account,
use `addModule`:

```typescript
{{#include ../experiments/documentation-examples/src/05-add-module.ts}}
```

Transpile and run the script:

```shell
npx tsc --build

node dist/05-add-module.js
```

### Register the public key associated with your P256 Private Key

Every module comes with a set of Management API. In the case of the P256
Validator, the associated interfaces are the following:

```rust
#[starknet::interface]
pub trait IPublicKey<TState> {
    fn set_public_key(ref self: TState, new_public_key: P256PublicKey);
    fn get_public_key(self: @TState) -> P256PublicKey;
}
```

Now that you have installed the module, you can create an ETH private key and
register the associated public key in the module. For the purpose of the
demonstration, we will use an arbitrary (and now **unsafe**) private/public
key pair:

- private key: 0x1efecf7ee1e25bb87098baf2aaab0406167aae0d5ea9ba0d31404bf01886bd0e
- public key:
  - x: 0x097420e05fbc83afe4d73b31890187d0cacf2c3653e27f434701a91625f916c2
    - x.low: 269579757328574126121444003492591638210 
    - x.high: 12566025211498978771503502663570524112
  - y: 0x98a304ff544db99c864308a9b3432324adc6c792181bae33fe7a4cbd48cf263a
    - y.low: 230988565823064299531546210785320445498
    - y.high: 202889101106158949967186230758848275236

Because Starknet types can only manage felt252 that are smaller than uint256
the format used by `P256PublicKey` is actually an `array<felt252>` that is made 
of `[x.low, x.high, y.low, y.high]`. To register the public key, use the
script below:

```typescript
{{#include ../experiments/documentation-examples/src/05-register-publickey.ts}}
```

Transpile and run the script:

```shell
npx tsc --build

node dist/05-register-publickey.js
```

You can check the public key is correctly registered with the script below:

```typescript
{{#include ../experiments/documentation-examples/src/05-get-publickey.ts}}
```

Transpile and run the script:

```shell
npx tsc --build

node dist/05-get-publickey.js
```

### Run a transaction with the P256Module

The `P256Module` is an implementation of a module that can be passed to
the `SmartrAccount` and manages the decoration of the transaction under the
hood. To fully instantiate that module, you will need:

- to instantiate the `P256Module` module from the SDK
- to use the `P256Signer` provided by `@0xknwn/starknet-module with the Private
  Key
- to instantiate the `SmartrAccount` with the 2 classes above

Then you can run a transaction, exactly as you would do with any Starknet.js
account. The example below execute the `increment` entrypoint on the `Counter`
contract:

```typescript
{{#include ../experiments/documentation-examples/src/05-execute-tx.ts}}
```

Transpile and run the script:

```shell
npx tsc --build

node dist/05-execute-tx.js
```

### Remove the P256 Validator Module

You can use `removeModule` and `isModule` to remove the module from the account
with the script below:

```typescript
{{#include ../experiments/documentation-examples/src/05-remove-module.ts}}
```

Transpile and run the script:

```shell
npx tsc --build

node dist/05-remove-module.js
```

## Using the P256 Validator as the Core Validator

You can also use the P256 Validator as a Core Validator for the account. For that
purpose you will deploy a new account and use the P256Signer to validate the
account deployment **without** registering the `P256Module` in the
`SmartrAccount`. In order to proceed you need to:

- Generate the public key as an Array of felt252
- Compute the account address
- Send ETH to the modular account address
- Deploy the Account

### Compute the Public Key as an Array of felt252

The P256Signer helps to generate the public key from the private key. Once you
have the public key you should slice to get an array of 4 pieces like below:

```typescript
const p236SmartrSigner = new P256Signer(p256PrivateKey);
const publicKey = await p236SmartrSigner.getPubKey();
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
  [moduleClassHash("P256Validator"), "0x4", ...publicKeyArray]
);
```

> Note: The "0x4" that is inserted in the calldata is here to indicate there are
> 4 pieces to the public key:

### Send ETH to the SmartrAccount Address to deploy it

To deploy the account, you need to have ETH associated with the target account
address. Assuming you have access to an account with ETH, this is how you send
p256 to the `computedAccountAddress`:

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

### Deploy the Account with the P256 Validator as Core

To deploy the account, you will need to use the `deployAccount` helper function
from `@0xknwn/starknet-modular-account` with a `SmartrAccount` that has been
instantiated with a `P256Signer` like below:

```typescript
const p256Account = new SmartrAccount(
  provider,
  computedAccountAddress,
  p236SmartrSigner
);
const address = await deployAccount(
  p256Account,
  "SmartrAccount",
  publicKeyHash,
  [moduleClassHash("P256Validator"), "0x4", ...publicKeyArray]
);
```

### The Script Code

You will find below the whole script that does the account deployment:

```typescript
{{#include ../experiments/documentation-examples/src/05-deploy-account.ts}}
```

Transpile and run it:

```shell
npx tsc --build

node dist/05-deploy-account.js
```

## Running a transaction with the P256 Validator as Core

Running a transaction with the P256Validator as a Core is no more complex than
running a transaction on a regular account. All you need to do is

- get the account address that could have been saved from earlier
- instantiate the `SmartrAccount` with the Starknet.js P256Signer
- execute the transaction

Below is an example that assumes you have deployed the account with the
`05-deploy-account.ts` script earlier:

```typescript
{{#include ../experiments/documentation-examples/src/05-execute-tx-core.ts}}
```

Transpile and run it:

```shell
npx tsc --build

node dist/05-execute-tx-core.js
```

As you can see from the script:

- You do not need the `P256Module` to interact with the account. That is because
  the validator is used as a Core Validator and, as such, the transaction does
  not required to be prefixed
- Running transactions is the same as running a transaction with the Stark
  validator. Only the signature changes!
