# Deploying the Modular Account

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
// file src/declare-class.ts
import { RpcProvider, Account } from "starknet";
import { declareClass } from "@0xknwn/starknet-modular-account";

// these are the settings for the devnet with --seed=0
// change them to mee your requirements
const providerURL="http://127.0.0.1:5050/rpc";
const ozAccountAddress="0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691";
const ozPrivateKey="0x71d7bb07b9a64f6f78ac4c816aff4da9";

const main = async () => {
  const provider = new RpcProvider({nodeUrl: providerURL});
  const account = new Account(provider, ozAccountAddress, ozPrivateKey);

  const { classHash: smartrAccountClassHash} = await declareClass(account, "SmartrAccount");
  console.log("smartrAccount class hash:", smartrAccountClassHash);

  const { classHash: coreValidatorClassHash} = await declareClass(account, "CoreValidator");
  console.log("coreValidator class hash:", coreValidatorClassHash);
}

main().then(() => {}).catch((e) => {console.warn(e)});
```

> Note: To declare the class, the account you use must be loaded with ETH.

Assuming you have named the script `src/deploy-class.ts`, to transpile it and
run it, use the script below:

```shell
npx tsc --build

node dist/declare-class.js
```

The output should return the classHash for the 2 classes.

## Verify the SmartrAccount and CoreValidator class hash

The 2 class hash do **NOT** depend on the deployment or the network. So you
can find them at any time with the `classHash` helper that comes with the
SDK. The script below shows how to use that function:

```typescript
// file src/check-class.ts
import { classHash } from "@0xknwn/starknet-modular-account";

console.log("smartrAccount class hash:", classHash("SmartrAccount"));
console.log("coreValidator class hash:", classHash("CoreValidator"));
```

Assuming you have named the script `src/check-class.ts`, to transpile it and
run it, use the script below:

```shell
npx tsc --build

node dist/check-class.js
```

## Charge ETH to the SmartrAccount Address to deploy it

Here again, the SDK provides a helper function called `deployAccount` to
help with the deployment of the modular account. Before you move forward with
the account, you must compute the account address with `accountAddress` and 
send ETH to it. To proceed, create a file named `src/load-eth.ts` like below:

```typescript
// file src/load-eth.ts
import { RpcProvider, Account, Signer, Contract, cairo } from "starknet";
import { accountAddress, classHash } from "@0xknwn/starknet-modular-account";
import { ABI as ERC20ABI } from "./abi/ERC20";

// these are the settings for the devnet with --seed=0
// change them to mee your requirements
const providerURL="http://127.0.0.1:5050/rpc";
const ozAccountAddress="0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691";
const ozPrivateKey="0x71d7bb07b9a64f6f78ac4c816aff4da9";
const smartrAccountPrivateKey="0x1";
const ethAddress="0x49D36570D4E46F48E99674BD3FCC84644DDD6B96F7C741B1562B82F9E004DC7";

const main = async () => {
  const provider = new RpcProvider({nodeUrl: providerURL});
  const account = new Account(provider, ozAccountAddress, ozPrivateKey);
  const smartrSigner = new Signer(smartrAccountPrivateKey)
  const smartrAccountPublicKey = await smartrSigner.getPubKey();
  const coreValidatorClassHash = classHash("CoreValidator");
  const smartrAccountAddress = accountAddress("SmartrAccount", smartrAccountPublicKey, [
      coreValidatorClassHash,
      smartrAccountPublicKey,
  ]);
  const ETH = new Contract(ERC20ABI, ethAddress, account);
  const initial_EthTransfer = cairo.uint256(3n * 10n ** 15n);
  const call = ETH.populate("transfer", {
    recipient: smartrAccountAddress, 
    amount: initial_EthTransfer,
  })
  const { transaction_hash } = await account.execute(call);
  const output = await account.waitForTransaction(transaction_hash);
  if (!output.isSuccess()) {
    throw new Error("Could not send ETH to the expected address");
  }
  console.log("accountAddress", smartrAccountAddress)
}

main().then(() => {}).catch((e) => {console.warn(e)});
```

> Note: You must create a file `abi/ERC20.ts` that contains the ABI of an ERC20
> in order to call it from a contract.

Assuming you have named the script `src/load-eth.ts`, to transpile it and
run it, use the script below:

```shell
npx tsc --build

node src/load-eth.js
```

The output should return the yet to come account address...

## Deploy the Modular Account

Now that the address has some ETH on it, you can deploy the account with the
`deployAccount` helper. Create a file named `src/deploy-account.ts` like below:

```typescript
// file src/deploy-account.ts
import { RpcProvider, Account, Signer, Contract, cairo } from "starknet";
import { accountAddress, classHash, deployAccount, SmartrAccount } from "@0xknwn/starknet-modular-account";

// these are the settings for the devnet with --seed=0
// change them to mee your requirements
const providerURL="http://127.0.0.1:5050/rpc";
const smartrAccountPrivateKey="0x1";

const main = async () => {
  const provider = new RpcProvider({nodeUrl: providerURL});
  const smartrSigner = new Signer(smartrAccountPrivateKey)
  const smartrAccountPublicKey = await smartrSigner.getPubKey();
  const coreValidatorClassHash = classHash("CoreValidator");
  const smartrAccountAddress = accountAddress("SmartrAccount", smartrAccountPublicKey, [
      coreValidatorClassHash,
      smartrAccountPublicKey,
  ]);
  const smartrAccount = new SmartrAccount(provider, smartrAccountAddress, smartrAccountPrivateKey);
  const address = await deployAccount(
        smartrAccount,
        "SmartrAccount",
        smartrAccountPublicKey,
        [coreValidatorClassHash, smartrAccountPublicKey]
      );
  if (address !== smartrAccountAddress) {
    throw new Error(`The account should have been deployed to ${smartrAccountAddress}, instead ${address}`);
  }
  console.log("accountAddress", smartrAccountAddress)
  console.log("public ket", smartrAccountPublicKey)
}

main().then(() => {}).catch((e) => {console.warn(e)});
```

Assuming you have named the script `src/deploy-account.ts`, to transpile it and
run it, use the script below:

```shell
npx tsc --build

node src/deploy-account.js
```

## Using the modular account from the SDK

You can use rely on the `SmartrAccount` class to use the account. The script
below shows all the requirements to compute the class hash, the address and 
instantiate the account:

```typescript
// file src/using-account.ts
import { RpcProvider, Signer } from "starknet";
import { accountAddress, classHash, SmartrAccount } from "@0xknwn/starknet-modular-account";

// these are the settings for the devnet with --seed=0
// change them to mee your requirements
const providerURL="http://127.0.0.1:5050/rpc";
const smartrAccountPrivateKey="0x1";

const main = async () => {
  const provider = new RpcProvider({nodeUrl: providerURL});
  const smartrSigner = new Signer(smartrAccountPrivateKey)
  const smartrAccountPublicKey = await smartrSigner.getPubKey();
  const coreValidatorClassHash = classHash("CoreValidator");
  const smartrAccountAddress = accountAddress("SmartrAccount", smartrAccountPublicKey, [
      coreValidatorClassHash,
      smartrAccountPublicKey,
  ]);
  const smartrAccount = new SmartrAccount(provider, smartrAccountAddress, smartrAccountPrivateKey);
  console.log("address", smartrAccount.address);
}

main().then(() => {}).catch((e) => {console.warn(e)});
```

Assuming you have named the script `src/using-account.ts`, to transpile it and
run it, use the script below:

```shell
npx tsc --build

node src/using-account.js
```
