// file src/02-add-publickey.ts
import {
  StarkValidatorABI,
  SmartrAccount,
  classHash,
} from "@0xknwn/starknet-modular-account";
import { init } from "./02-init";
import { CallData, RpcProvider, Signer } from "starknet";

const providerURL = "http://127.0.0.1:5050/rpc";
const newAccountPrivateKey = "0x2";

const main = async () => {
  const signer = new Signer(newAccountPrivateKey);
  const newAccountPublicKey = await signer.getPubKey();
  console.log("second account public key", newAccountPublicKey);
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const { accountAddress, smartrAccountPrivateKey } = await init();
  const account = new SmartrAccount(
    provider,
    accountAddress,
    smartrAccountPrivateKey
  );
  const moduleCallData = new CallData(StarkValidatorABI);
  const calldata = await moduleCallData.compile("set_public_key", {
    new_public_key: newAccountPublicKey,
  });
  const { transaction_hash } = await account.executeOnModule(
    classHash("StarkValidator"),
    "set_public_key",
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
