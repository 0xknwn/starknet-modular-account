// file src/04-execute-tx-core.ts
import {
  SmartrAccount,
  accountAddress,
} from "@0xknwn/starknet-modular-account";
import { init, CounterABI } from "./04-init";
import { RpcProvider, Contract, EthSigner, cairo, hash } from "starknet";
import { classHash as ethClassHash } from "@0xknwn/starknet-module";
const providerURL = "http://127.0.0.1:5050/rpc";
const ethPrivateKey =
  "0xb28ebb20fb1015da6e6367d1b5dba9b52862a06dbb3a4022e4749b6987ac1bd2";

const main = async () => {
  // recompute the account address
  const signer = new EthSigner(ethPrivateKey);
  const publicKey = await signer.getPubKey();
  const coords = publicKey.slice(2, publicKey.length);
  const x = coords.slice(0, 64);
  const x_felts = cairo.uint256(`0x${x}`);
  const y = coords.slice(64, 128);
  const y_felts = cairo.uint256(`0x${y}`);
  const publicKeyArray = [
    x_felts.low.toString(),
    x_felts.high.toString(),
    y_felts.low.toString(),
    y_felts.high.toString(),
  ];

  const publicKeyHash = hash.computeHashOnElements(publicKeyArray);
  const computedAccountAddress = accountAddress(
    "SmartrAccount",
    publicKeyHash,
    [ethClassHash("EthValidator"), "0x4", ...publicKeyArray]
  );

  // execute the transaction
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const { counterAddress } = await init();
  const account = new SmartrAccount(provider, computedAccountAddress, signer);
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
