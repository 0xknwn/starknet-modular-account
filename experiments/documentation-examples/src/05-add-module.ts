// file src/05-add-module.ts
import { SmartrAccount } from "@0xknwn/starknet-modular-account";
import { classHash } from "@0xknwn/starknet-module";
import { init } from "./05-init";
import { RpcProvider } from "starknet";

const ozAccountAddress =
  "0x3b2d6d0edcbdbdf6548d2b79531263628887454a0a608762c71056172d36240";
const ozPrivateKey =
  "0x000e8f079f1092042bf9b855935d3ef1bb7078609491fb24e7cb8cbb574e50ca";
const providerURL = "https://starknet-sepolia.public.blastapi.io";

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
