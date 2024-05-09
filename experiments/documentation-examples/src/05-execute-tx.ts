// file src/05-execute-tx.ts
import { SmartrAccount } from "@0xknwn/starknet-modular-account";
import { init, CounterABI } from "./03-init";
import { RpcProvider, Contract, EthSigner } from "starknet";
import { P256Module, P256Signer } from "@0xknwn/starknet-module";

const providerURL = "http://127.0.0.1:5050/rpc";
const p256PrivateKey =
  "0x1efecf7ee1e25bb87098baf2aaab0406167aae0d5ea9ba0d31404bf01886bd0e";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const { accountAddress, counterAddress, smartrAccountPrivateKey } =
    await init();
  const signer = new P256Signer(p256PrivateKey);
  const p256Module = new P256Module(accountAddress);
  const account = new SmartrAccount(
    provider,
    accountAddress,
    signer,
    p256Module
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
