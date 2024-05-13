// file src/04-get-threshold.ts
import { SmartrAccount } from "@0xknwn/starknet-modular-account";
import {
  MultisigValidatorABI,
  classHash as moduleClassHash,
} from "@0xknwn/starknet-module";
import { init } from "./03-init";
import { CallData, RpcProvider } from "starknet";

const providerURL = "http://127.0.0.1:5050/rpc";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const { accountAddress, smartrAccountPrivateKey } = await init();
  const account = new SmartrAccount(
    provider,
    accountAddress,
    smartrAccountPrivateKey
  );
  const moduleCallData = new CallData(MultisigValidatorABI);
  const calldata = await moduleCallData.compile("get_threshold", {});
  const threshold = await account.callOnModule(
    moduleClassHash("MultisigValidator"),
    "get_threshold",
    calldata
  );
  threshold.forEach((threshold) => console.log("threshold", threshold));
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
