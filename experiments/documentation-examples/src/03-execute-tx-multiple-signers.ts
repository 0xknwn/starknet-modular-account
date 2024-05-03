// file src/03-execute-tx-multiple-signers.ts
import { SmartrAccount } from "@0xknwn/starknet-modular-account";
import { init, CounterABI } from "./03-init";
import { RpcProvider, Contract, ArraySignatureType } from "starknet";

const providerURL = "http://127.0.0.1:5050/rpc";
const secondSmartrAccountPrivateKey = "0x2";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const { accountAddress, counterAddress, smartrAccountPrivateKey } =
    await init();
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

  // Before you start check the value of the counter
  const counter = new Contract(CounterABI, counterAddress, provider);
  let currentCounter = await counter.call("get");
  console.log("currentCounter value", currentCounter);

  // Step 1: Prepare the transaction and get the details
  const call = counter.populate("increment");
  const calls = [call];

  const detail = await firstAccount.prepareMultisig(calls);
  console.log("below are the details assciated with the transaction");
  console.log(detail);

  // Step 2: Sign the transaction with 2 signers
  // (because the threshold on the account is currently 2)
  const firstSignature: ArraySignatureType = await firstAccount.signMultisig(
    calls,
    detail
  );
  console.log("first signature is", firstSignature);
  const secondSignature: ArraySignatureType = await secondAccount.signMultisig(
    calls,
    detail
  );
  console.log("second signature is", secondSignature);

  // Step 3: Execute the transaction
  const { transaction_hash } = await firstAccount.executeMultisig(
    calls,
    detail,
    [...firstSignature, ...secondSignature]
  );
  const receipt = await firstAccount.waitForTransaction(transaction_hash);
  console.log("transaction succeeded", receipt.isSuccess());

  // Once finished, check the value of the counter again
  currentCounter = await counter.call("get");
  console.log("currentCounter value", currentCounter);
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
