// file src/02-execute-tx-pk2.ts
import { SmartrAccount } from "@0xknwn/starknet-modular-account";
import { init, CounterABI } from "./02-init";
import { RpcProvider, Contract } from "starknet";

const providerURL = "http://127.0.0.1:5050/rpc";
const secondSmartrAccountPrivateKey = "0x2";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const { accountAddress, counterAddress } = await init();
  const account = new SmartrAccount(
    provider,
    accountAddress,
    secondSmartrAccountPrivateKey
  );
  const counter = new Contract(CounterABI, counterAddress, account);
  let currentCounter = await counter.call("get");
  console.log("currentCounter", currentCounter);
  const call = counter.populate("increment");
  const { transaction_hash } = await account.execute(call);
  const receipt = await account.waitForTransaction(transaction_hash);
  console.log("transaction succeeded", receipt.isSuccess());
  currentCounter = await counter.call("get");
  console.log("currentCounter", currentCounter);
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
