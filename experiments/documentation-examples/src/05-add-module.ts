// file src/05-add-module.ts
import { SmartrAccount } from "@0xknwn/starknet-modular-account";
import { classHash } from "@0xknwn/starknet-module";
import { init } from "./05-init";
import { RpcProvider } from "starknet";

const providerURL = "http://127.0.0.1:5050/rpc";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const { accountAddress, smartrAccountPrivateKey } = await init();
  const account = new SmartrAccount(
    provider,
    accountAddress,
    smartrAccountPrivateKey
  );
  const { transaction_hash } = await account.addModule(
    classHash("P256Validator")
  );
  const receipt = await account.waitForTransaction(transaction_hash);
  console.log("transaction succeeded", receipt.isSuccess());

  const isInstalled = await account.isModule(classHash("P256Validator"));
  console.log(
    "module",
    classHash("P256Validator"),
    "is installed:",
    isInstalled
  );
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
