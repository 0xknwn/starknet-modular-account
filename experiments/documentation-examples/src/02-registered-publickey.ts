// file src/02-registered-publickeys.ts
import {
  StarkValidatorABI,
  SmartrAccount,
  classHash,
} from "@0xknwn/starknet-modular-account";
import { init } from "./02-init";
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
  const calldata = await moduleCallData.compile("get_public_key", {});
  const publickey = await account.callOnModule(
    classHash("StarkValidator"),
    "get_public_key",
    calldata
  );
  console.log("publickey is", `0x${BigInt(publickey[0]).toString(16)}`);
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
