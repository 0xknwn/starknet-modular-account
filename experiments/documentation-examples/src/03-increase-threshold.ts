// file src/03-increase-threshold.ts
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
  const calldata = moduleCallData.compile("set_threshold", {
    new_threshold: 2,
  });
  const { transaction_hash } = await account.executeOnModule(
    moduleClassHash("MultisigValidator"),
    "set_threshold",
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
