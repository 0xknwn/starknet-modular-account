# Using the SessionKey Validator

The starknet modular account comes with the `@0xknwn/starknet-module-sessionkey`
SDK that you can use to work with the sessionkey validator. In this section,
you will see, how to install and use the validator, how to request a sessionkey
and how to use it.

- [Using the SessionKey Validator](#using-the-sessionkey-validator)
  - [Install the SessionKey Validator](#install-the-sessionkey-validator)
  - [Register the SessionKey Validator as a Module](#register-the-sessionkey-validator-as-a-module)
  - [Requesting a Session Key](#requesting-a-session-key)
    - [Create and Manage Policies](#create-and-manage-policies)
    - [Create a SessionKeyModule](#create-a-sessionkeymodule)
    - [Request a Grant by the Account Core Validator Signer](#request-a-grant-by-the-account-core-validator-signer)
    - [Get the Session Key Grant](#get-the-session-key-grant)
    - [Register the Core Validator Signature with the SessionKeyModule](#register-the-core-validator-signature-with-the-sessionkeymodule)
    - [Create an Account with the SessionKeyModule](#create-an-account-with-the-sessionkeymodule)
    - [Complete Source Code](#complete-source-code)
  - [Execute a Transaction with the Session Key](#execute-a-transaction-with-the-session-key)
  - [Invalidate the Session Key](#invalidate-the-session-key)
  - [Remove the SessionKey Validator Module from the Account](#remove-the-sessionkey-validator-module-from-the-account)


> Note: This section assumes the `SmartrAccount` class has been instantiated
> in the `smartrAccount` variable as shown in
> [Using the modular account from the SDK](./SDKS-DEPLOYMENT.md#using-the-modular-account-from-the-sdk).
> It also assumes the `Counter` contract that comes with the project has been
> deploys to the `counterAddress` and the `CounterABI` class are available. The
> `04-setup.ts` script that comes with this project ensure those steps are
> executed.

## Install the SessionKey Validator

`@0xknwn/starknet-module-sessionkey` is a SDK that complements 
`@0xknwn/starknet-modular-account` and provide the tools to manage the module
and interact with it from the `SmartrAccount`. Start by adding the module to
the project with a command like the one below:

```shell
npm install --save @0xknwn/starknet-module-sessionkey
```

If you are working on a network that does not have the sessionkey module class
declared already, like the devnet, you should declare the class. The
`declareClass` function that comes with the SDK allow such an installation.
Below is an example of a script that install the module class:

```typescript
{{#include ../experiments/documentation-examples/src/04-declare-class.ts}}
```

> Note: To declare the class, the account you use must be loaded with ETH. In
> order to do it, you can use any account, including the modular account.

Transpile it and run the script with the commands below:

```shell
npx tsc --build

node dist/04-declare-class.js
```

> Note: only the `declareClass` function from `@0xknwn/starknet-module-sessionkey`
> can declare the Sessionkey Validator class. If you are using the `declareClass` 
> function from `@0xknwn/starknet-modular-account`, you will be able to declare
> the Stark Validator and the Modular Account class but not the SessionKey
> Validator.

## Register the SessionKey Validator as a Module

The modular account SDK comes with the `addModule`, `removeModule` and
`isModule`. You can use those 3 functions to manage the module in the account
once it has been declared to the network. To register the module in the account,
use `addModule`:

```typescript
{{#include ../experiments/documentation-examples/src/04-add-module.ts}}
```

Transpile and run the script with the commands below:

```shell
npx tsc --build

node dist/04-add-module.js
```

## Requesting a Session Key

Once the module is installed in the account, a dapp can request a grant
associated with a private key. In order to get that authorization, it must
first built a session key request. A request is made of the following elements:

- the `account address`. A session key is granted to an account and cannot be
  used with another one.
- the `sessionkey validator module class hash`. Because an account could have
  several sessionkey module installed, we want to make sure the session key is
  granted to a very specific module.
- the `core validator class hash`. Here we want to make sure the sessionkey
  grantor is the core validator for the account to prevent checking a signature
  with another module from the account
- the dapp `public key` that is associated with the session key request. Once
  the session key is authorized, the dapp will only be able to sign transactions
  with its private key counterpart.
- an `expiration time`. Here again, we want the session key to be limited in
  time and we strongly suggest the signer keep that period short.
- an array of policies, i.e a list of (1) `contract addresses` and (2)
  `entrypoints` the dapp will be able to call with that session key. Keep in
  mind that many contracts are upgradeable and that a good practice would be to
  grant an access only to a contract that is open-sourced, audited and not
  upgradeable.
- the chain id. This is something that might be remove in a later version of the
  session key because the account address already depends of the chain id.
  However, this element is mandatory to request a sessionkey grant

### Create and Manage Policies

Policies are very specific to session keys and as such, the sessionkey SDK, i.e
`@0xknwn/starknet-module-sessionkey` provides a class named `PolicyManager` that
helps to manage them. There are 2 main time do you want to use that class:

- When requesting a sessionkey. That is because you do not use the array of
  policies but a hash of each one of them and a merkle tree of those hashes.
  The `PolicyManager` that comes with the SDK provides you with that Merkle
  tree root that is actually what is used to request the sessionkey grant.
- When signing a transaction with the session key. That is because when you
  sign a transaction, not only you need to provide a valid signature of the
  transaction with the private key that has been granted the access but you
  also need to provide the merkle proofs that the call that are used in the
  transaction are part of the policy array.

So assuming you want to grant an access to the `increment` and `increment_by` 
entrypoints of the Counter class and assuming `counterAddress` contains counter
address, to use the `PolicyManager` class, you will call its constructor like
below:

```typescript
const policyManager = new PolicyManager([
  { contractAddress: counterContract.address, selector: "increment" },
  { contractAddress: counterContract.address, selector: "increment_by" },
]);
```

The `policyManager.getRoot()` function will return the root of the merkle tree
associated with the policies.

> Note: The second useful function of `PolicyManager` is the
> `getProof(policy)` function. However, once the session key module registered
> in `SmartrAccount` that function is used by the account and you should not
> use it by yourself.

### Create a SessionKeyModule

The `SessionKeyModule` is an implementation of a module that can be passed to
the `SmartrAccount` and manages the decoration of the transaction under the
hood. To fully instantiate that module, you will need:

- all the data above
- to request/get an authorization from the core validator signer
- to add the signature provided by the grantor back into the module

The first step consists in instantiating the `SessionKeyModule` with all the
data associated with the session key:

```typescript
const sessionKeyModule = new SessionKeyModule(
  sessionkeyPublicKey,
  accountAddress,
  sessionkeyClassHash,
  chain,
  expires,
  policyManager
);
```

### Request a Grant by the Account Core Validator Signer

To request the authorization you should call the `request` method on the module
with the `corevalidatorClassHash` like below:

```typescript
const request = await sessionKeyModule.request(corevalidatorClassHash);
```

> Note: this step is very important because it stores the
> `corevalidatorClassHash` in the module.

### Get the Session Key Grant

Now, you need to use the core validator signer to provide the signature that
will be necessary for the module to be activated. The sessionkey SDK provides
the `SessionKeyGrantor` to help you with signing the request. To generate
the signature, run the `sign` method on it:

```typescript
const grantor = new SessionKeyGrantor(
  corevalidatorClassHash,
  smartrAccountPrivateKey
);
const signature = await grantor.sign(sessionKeyModule);
```

### Register the Core Validator Signature with the SessionKeyModule

To finish with the module configuration, you just have to add the signature
to it like below:

```typescript
sessionKeyModule.add_signature(signature);
```

### Create an Account with the SessionKeyModule

Now you can create an Account with the `SmartrAccount` class. The class
constructor can use a module as a 4th argument of the constructor like below:

```typescript
const smartrAccountWithSessionKey = new SmartrAccount(
  provider,
  accountAddress,
  sessionkeyPrivateKey,
  sessionKeyModule
);
```

> Note: here you are not using the private key from the core validator signer
> but the private key generated by your dapp.

### Complete Source Code

The overall sessionkey request/grant process with the execition of a transaction
on the counter contract is available here:

```typescript
{{#include ../experiments/documentation-examples/src/04-sessionkey-transaction.ts}}
```

Transpile and run the script with the commands below:

```shell
npx tsc --build

node dist/04-sessionkey-transaction.js
```

## Execute a Transaction with the Session Key

As you can see from above, executing a transaction with a session key is
exactly the same as executing any transaction with a starknet.js account. All
you need to do is to use the `SmartrAccount` that comes with the
`@0xknwn/starknet-modular-account` SDK with the `SessionKeyModule` from the
`@0xknwn/starknet-module-sessionkey` SDK. 

## Invalidate the Session Key

If needed, you can block a session key. To proceed, you would need the hash of
the session key as shown in the `request`. That is the hash that is actually
signed by the core validator signer and stored in `sessionkeyHash` in the
script. Then, you can use `disable_session_key` entrypoint on the module with
the `executeOnModule` entrypoint of the account:

```typescript
{{#include ../experiments/documentation-examples/src/04-block-sessionkey.ts}}
```

Transpile and run the script with the commands below:

```shell
npx tsc --build

node dist/04-block-sessionkey.js
```

## Remove the SessionKey Validator Module from the Account

To remove the module from the account, use `removeModule`:

```typescript
{{#include ../experiments/documentation-examples/src/04-remove-module.ts}}
```

Transpile and run the script with the commands below:

```shell
npx tsc --build

node dist/04-remove-module.js
```
