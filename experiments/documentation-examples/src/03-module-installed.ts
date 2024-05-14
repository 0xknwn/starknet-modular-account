// file src/03-module-installed.ts
import { SmartrAccount } from "@0xknwn/starknet-modular-account";
import { classHash } from "@0xknwn/starknet-module";
import { init } from "./03-init";
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
  const isInstalled = await account.isModule(classHash("MultisigValidator"));
  console.log(
    "module",
    classHash("MultisigValidator"),
    "is installed",
    isInstalled
  );
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
