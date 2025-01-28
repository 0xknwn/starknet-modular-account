// file src/05-add-module.ts
import { SmartrAccount } from "@0xknwn/starknet-modular-account";
import {
  classHash,
  classNames as moduleClassNames,
} from "@0xknwn/starknet-module";
import { init } from "./05-init";
import { RpcProvider } from "starknet";

const ozAccountAddress =
  "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691";
const ozPrivateKey = "0x71d7bb07b9a64f6f78ac4c816aff4da9";
const providerURL = "http://127.0.0.1:5050/rpc";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const { accountAddress, smartrAccountPrivateKey } = await init();
  const account = new SmartrAccount(
    provider,
    accountAddress,
    smartrAccountPrivateKey,
    undefined,
    "1",
    "0x3"
  );
  const { transaction_hash } = await account.addModule(
    classHash(moduleClassNames.P256Validator)
  );
  const receipt = await account.waitForTransaction(transaction_hash);
  console.log("transaction succeeded", receipt.isSuccess());

  const isInstalled = await account.isModule(
    classHash(moduleClassNames.P256Validator)
  );
  console.log(
    "module",
    classHash(moduleClassNames.P256Validator),
    "is installed:",
    isInstalled
  );
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
