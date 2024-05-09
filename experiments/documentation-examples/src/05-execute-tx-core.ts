// file src/05-execute-tx-core.ts
import {
  SmartrAccount,
  accountAddress,
} from "@0xknwn/starknet-modular-account";
import { init, CounterABI } from "./05-init";
import { RpcProvider, Contract, cairo, hash } from "starknet";
import {
  classHash as moduleClassHash,
  P256Signer,
} from "@0xknwn/starknet-module";
const providerURL = "http://127.0.0.1:5050/rpc";
const p256PrivateKey =
  "0x1efecf7ee1e25bb87098baf2aaab0406167aae0d5ea9ba0d31404bf01886bd0e";

const main = async () => {
  // recompute the account address
  const signer = new P256Signer(p256PrivateKey);
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
    [moduleClassHash("P256Validator"), "0x4", ...publicKeyArray]
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
