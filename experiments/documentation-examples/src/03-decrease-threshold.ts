// file src/03-decrease-threshold.ts
import {
  CoreValidatorABI,
  SmartrAccount,
  classHash,
  SmartrAccountABI,
} from "@0xknwn/starknet-modular-account";
import { init } from "./03-init";
import {
  CallData,
  RpcProvider,
  hash,
  type Call,
  type ArraySignatureType,
} from "starknet";

const providerURL = "http://127.0.0.1:5050/rpc";
const secondSmartrAccountPrivateKey = "0x2";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const { accountAddress, smartrAccountPrivateKey } = await init();
  const firstAccount = new SmartrAccount(
    provider,
    accountAddress,
    smartrAccountPrivateKey
  );
  const secondAccount = new SmartrAccount(
    provider,
    accountAddress,
    secondSmartrAccountPrivateKey
  );

  // Before you start build the set_threshold call
  const moduleCallData = new CallData(CoreValidatorABI);
  const moduleCalldata = moduleCallData.compile("set_threshold", {
    new_threshold: 1,
  });
  const accountCallData = new CallData(SmartrAccountABI);
  const calldata = accountCallData.compile("execute_on_module", {
    class_hash: classHash("CoreValidator"),
    call: {
      selector: hash.getSelectorFromName("set_threshold"),
      to: accountAddress,
      calldata: moduleCalldata,
    },
  });
  const call: Call = {
    entrypoint: "execute_on_module",
    contractAddress: accountAddress,
    calldata,
  };
  const calls = [call];

  // Step 1: Prepare the transaction and get the details
  const detail = await firstAccount.prepareMultisig(calls);

  // Step 2: Sign the transaction with 2 signers
  // (because the threshold on the account is currently 2)
  const firstSignature: ArraySignatureType = await firstAccount.signMultisig(
    calls,
    detail
  );
  const secondSignature: ArraySignatureType = await secondAccount.signMultisig(
    calls,
    detail
  );

  // Step 3: Execute the transaction
  const { transaction_hash } = await firstAccount.executeMultisig(
    calls,
    detail,
    [...firstSignature, ...secondSignature]
  );
  const receipt = await firstAccount.waitForTransaction(transaction_hash);
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
