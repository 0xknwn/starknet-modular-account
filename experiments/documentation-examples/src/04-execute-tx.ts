// file src/04-execute-tx.ts
import { SmartrAccount } from "@0xknwn/starknet-modular-account";
import { init, CounterABI } from "./04-init";
import { RpcProvider, Contract, EthSigner } from "starknet";
import { EthModule } from "@0xknwn/starknet-module";

const providerURL = "http://127.0.0.1:5050/rpc";
const ethPrivateKey =
  "0xb28ebb20fb1015da6e6367d1b5dba9b52862a06dbb3a4022e4749b6987ac1bd2";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const { accountAddress, counterAddress } = await init();
  console.log("accountAddress", accountAddress);
  const signer = new EthSigner(ethPrivateKey);
  const ethModule = new EthModule(accountAddress);
  const account = new SmartrAccount(
    provider,
    accountAddress,
    signer,
    ethModule,
    "1",
    "0x3"
  );
  console.log("counterAddress", counterAddress);
  const counter = new Contract(CounterABI, counterAddress, account);
  let currentCounter = await counter.call("get");
  console.log("currentCounter", currentCounter);
  const call = counter.populate("increment");
  const { transaction_hash } = await account.execute(call, {
    version: "0x3",
    resourceBounds: {
      l2_gas: {
        max_amount: "0x0",
        max_price_per_unit: "0x0",
      },
      l1_gas: {
        max_amount: "0x2f10",
        max_price_per_unit: "0x22ecb25c00",
      },
    },
  });
  console.log("transaction_hash", transaction_hash);
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
