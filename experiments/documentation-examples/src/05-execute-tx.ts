// file src/05-execute-tx.ts
import { SmartrAccount } from "@0xknwn/starknet-modular-account";
import { init, CounterABI } from "./03-init";
import { RpcProvider, Contract, EthSigner } from "starknet";
import { EthModule } from "@0xknwn/starknet-module";

const providerURL = "http://127.0.0.1:5050/rpc";
const ethPrivateKey =
  "0xb28ebb20fb1015da6e6367d1b5dba9b52862a06dbb3a4022e4749b6987ac1bd2";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const { accountAddress, counterAddress, smartrAccountPrivateKey } =
    await init();
  const signer = new EthSigner(ethPrivateKey);
  const ethModule = new EthModule(accountAddress);
  const account = new SmartrAccount(
    provider,
    accountAddress,
    signer,
    ethModule
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
