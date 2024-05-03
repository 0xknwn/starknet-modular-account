// file src/02-module-installed.ts
import { SmartrAccount, classHash } from "@0xknwn/starknet-modular-account";
import { init } from "./02-init";
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
  const isInstalled = await account.isModule(classHash("CoreValidator"));
  console.log(
    "module",
    classHash("CoreValidator"),
    "is installed",
    isInstalled
  );
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
