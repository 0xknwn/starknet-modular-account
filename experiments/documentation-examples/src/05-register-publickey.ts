// file src/05-register-publickey.ts
import { SmartrAccount } from "@0xknwn/starknet-modular-account";
import { classHash as ethClassHash } from "@0xknwn/starknet-module";
import { EthSigner, cairo } from "starknet";
import { init } from "./05-init";
import { RpcProvider } from "starknet";

const providerURL = "http://127.0.0.1:5050/rpc";
const ethPrivateKey =
  "0xb28ebb20fb1015da6e6367d1b5dba9b52862a06dbb3a4022e4749b6987ac1bd2";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const { accountAddress, smartrAccountPrivateKey } = await init();
  const account = new SmartrAccount(
    provider,
    accountAddress,
    smartrAccountPrivateKey
  );
  const module_class_hash = ethClassHash("EthValidator");
  const signer = new EthSigner(ethPrivateKey);
  const publicKey = await signer.getPubKey();
  const coords = publicKey.slice(2, publicKey.length);
  const x = coords.slice(0, 64);
  const x_felts = cairo.uint256(`0x${x}`);
  const y = coords.slice(64, 128);
  const y_felts = cairo.uint256(`0x${y}`);
  console.log("x:", `0x${x}`);
  console.log("(x.low:", x_felts.low, ", x.high:", x_felts.high, ")");
  console.log("y:", `0x${y}`);
  console.log("(y.low:", y_felts.low, ", y.high:", y_felts.high, ")");
  const { transaction_hash } = await account.executeOnModule(
    module_class_hash,
    "set_public_key",
    [
      x_felts.low.toString(),
      x_felts.high.toString(),
      y_felts.low.toString(),
      y_felts.high.toString(),
    ]
  );
  const receipt = await account.waitForTransaction(transaction_hash);
  console.log("transaction succeeded", receipt.isSuccess());
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
