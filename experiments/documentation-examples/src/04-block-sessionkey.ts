// file src/04-block-sessionkey.ts
import { SmartrAccount } from "@0xknwn/starknet-modular-account";
import {
  classHash as sessionkeyClassHash,
  SessionKeyValidatorABI,
} from "@0xknwn/starknet-module-sessionkey";
import { init } from "./04-init";
import { CallData, RpcProvider } from "starknet";

const providerURL = "http://127.0.0.1:5050/rpc";
const sessionkeyHash = "0x7";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const { accountAddress, smartrAccountPrivateKey } = await init();
  const account = new SmartrAccount(
    provider,
    accountAddress,
    smartrAccountPrivateKey
  );

  const moduleCallData = new CallData(SessionKeyValidatorABI);
  const calldata = moduleCallData.compile("disable_session_key", {
    sessionkey: sessionkeyHash,
  });
  const { transaction_hash } = await account.executeOnModule(
    sessionkeyClassHash("SessionKeyValidator"),
    "disable_session_key",
    calldata
  );
  const receipt = await account.waitForTransaction(transaction_hash);
  console.log("transaction succeeded", receipt.isSuccess());
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
