// file src/06-remove-module.ts
import { SmartrAccount } from "@0xknwn/starknet-modular-account";
import {
  classHash,
  classNames as sessionkeyClassNames,
} from "@0xknwn/starknet-module-sessionkey";
import { init } from "./06-init";
import { RpcProvider } from "starknet";

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
  const { transaction_hash } = await account.removeModule(
    classHash(sessionkeyClassNames.SessionKeyValidator)
  );
  const receipt = await account.waitForTransaction(transaction_hash);
  console.log("transaction succeeded", receipt.isSuccess());

  const isInstalled = await account.isModule(
    classHash(sessionkeyClassNames.SessionKeyValidator)
  );
  console.log(
    "module",
    classHash(sessionkeyClassNames.SessionKeyValidator),
    "has been removed",
    isInstalled
  );
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
