// file src/03-add-publickeys.ts
import {
  SmartrAccountABI,
  CoreValidatorABI,
  SmartrAccount,
  classHash,
} from "@0xknwn/starknet-modular-account";
import { init } from "./03-init";
import { CallData, RpcProvider, Signer, hash, type Call } from "starknet";

const providerURL = "http://127.0.0.1:5050/rpc";
const secondAccountPrivateKey = "0x2";
const thirdAccountPrivateKey = "0x3";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const { accountAddress, smartrAccountPrivateKey } = await init();
  const account = new SmartrAccount(
    provider,
    accountAddress,
    smartrAccountPrivateKey
  );
  const module_class_hash = classHash("CoreValidator");
  const calls: Call[] = [];
  for (const privateKey of [secondAccountPrivateKey, thirdAccountPrivateKey]) {
    const signer = new Signer(privateKey);
    const publicKey = await signer.getPubKey();
    console.log("new account public key", publicKey);
    const moduleCallData = new CallData(CoreValidatorABI);
    const moduleCalldata = moduleCallData.compile("add_public_key", {
      new_public_key: publicKey,
    });
    const accountCallData = new CallData(SmartrAccountABI);
    const calldata = accountCallData.compile("execute_on_module", {
      class_hash: module_class_hash,
      call: {
        selector: hash.getSelectorFromName("add_public_key"),
        to: accountAddress,
        calldata: moduleCalldata,
      },
    });
    const call: Call = {
      entrypoint: "execute_on_module",
      contractAddress: accountAddress,
      calldata,
    };
    calls.push(call);
  }
  const { transaction_hash } = await account.execute(calls);
  const receipt = await account.waitForTransaction(transaction_hash);
  console.log("transaction succeeded", receipt.isSuccess());
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });