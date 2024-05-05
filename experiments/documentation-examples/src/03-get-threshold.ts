// file src/02-registered-publickeys.ts
import {
  StarkValidatorABI,
  SmartrAccount,
  classHash,
} from "@0xknwn/starknet-modular-account";
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
  const moduleCallData = new CallData(StarkValidatorABI);
  const calldata = await moduleCallData.compile("get_threshold", {});
  const threshold = await account.callOnModule(
    classHash("StarkValidator"),
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
