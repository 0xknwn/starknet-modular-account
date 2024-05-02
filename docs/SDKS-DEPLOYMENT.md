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

## Deploy the SmartrAccount account

Here again, the SDK provides a helper function called `deploySmartrAccount` to
help with the deployment of an account:

```typescript
// file src/deploy-account.ts
import { RpcProvider, Account, Signer, cairo } from "starknet";
import { deploySmartrAccount, classHash } from "@0xknwn/starknet-modular-account";

// these are the settings for the devnet with --seed=0
// change them to mee your requirements
const providerURL="http://127.0.0.1:5050/rpc";
const ozAccountAddress="0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691";
const ozPrivateKey="0x71d7bb07b9a64f6f78ac4c816aff4da9";
const smartrAccountPrivateKey="0x1";


const main = async () => {
  const provider = new RpcProvider({nodeUrl: providerURL});
  const account = new Account(provider, ozAccountAddress, ozPrivateKey);
  const smartrSigner = new Signer(smartrAccountPrivateKey)
  const smartrAccountPublicKey = await smartrSigner.getPubKey();
  const coreValidatorClassHash = classHash("CoreValidator");
  const initial_EthTransfer = cairo.uint256(5n*10n**15n)
  const accountAddress = await deploySmartrAccount(
      account,
      smartrAccountPublicKey,
      coreValidatorClassHash,
      initial_EthTransfer
  );
  console.log("accountAddress", accountAddress)
}

main().then(() => {}).catch((e) => {console.warn(e)});
```

> Note: To declare the class, the account you use must be loaded with ETH.

Assuming you have named the script `src/deploy-account.ts`, to transpile it and
run it, use the script below:

```shell
npx tsc --build

node dist/deploy-account.js
```

The output should return the classHash for the 2 classes.

## Verify the SmartrAccount address

