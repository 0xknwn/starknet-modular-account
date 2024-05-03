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


```typescript
// file src/execute-transaction.ts
import { smartrAccount, counterAdress } from "./preinstall";
import { ABI as CounterABI } from "./abi/Counter.ts";
import { Contract } from "starknet";

const main = async () => {
  const counter = new RpcProvider({nodeUrl: providerURL});
  const account = new Account(provider, ozAccountAddress, ozPrivateKey);

  const { classHash: smartrAccountClassHash} = await declareClass(account, "SmartrAccount");
  console.log("smartrAccount class hash:", smartrAccountClassHash);

  const { classHash: coreValidatorClassHash} = await declareClass(account, "CoreValidator");
  console.log("coreValidator class hash:", coreValidatorClassHash);
}

main().then(() => {}).catch((e) => {console.warn(e)});
```

## Checking the Core Validator

## Using the Stark Validator API

## Calling views functions in the module

## Executing external functions in the module

