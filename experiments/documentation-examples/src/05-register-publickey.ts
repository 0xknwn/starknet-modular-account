// file src/05-register-publickey.ts
import { SmartrAccount } from "@0xknwn/starknet-modular-account";
import {
  classHash as moduleClassHash,
  P256Signer,
} from "@0xknwn/starknet-module";
import { cairo } from "starknet";
import { init } from "./05-init";
import { RpcProvider } from "starknet";

const providerURL = "https://starknet-sepolia.public.blastapi.io";
const p256PrivateKey =
  "0x1efecf7ee1e25bb87098baf2aaab0406167aae0d5ea9ba0d31404bf01886bd0e";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const { accountAddress, smartrAccountPrivateKey } = await init();
  const account = new SmartrAccount(
    provider,
    accountAddress,
    smartrAccountPrivateKey
  );
  const module_class_hash = moduleClassHash("P256Validator");
  const signer = new P256Signer(p256PrivateKey);
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
