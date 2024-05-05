// file src/04-sessionkey-transaction.ts
import { SmartrAccount, classHash } from "@0xknwn/starknet-modular-account";
import {
  classHash as sessionkeyClassHash,
  PolicyManager,
  SessionKeyModule,
  SessionKeyGrantor,
} from "@0xknwn/starknet-module-sessionkey";
import { init, CounterABI } from "./04-init";
import { RpcProvider, Signer, Contract } from "starknet";

const providerURL = "http://127.0.0.1:5050/rpc";
const sessionkeyPrivateKey = "0x4";

const main = async () => {
  const { counterAddress, smartrAccountPrivateKey, accountAddress } =
    await init();
  const provider = new RpcProvider({ nodeUrl: providerURL });

  // Step 1: Collect all the necessary information to request a sessionkey
  // Authorization to the modular account signers
  const signer = new Signer(sessionkeyPrivateKey);
  const sessionkeyPublicKey = await signer.getPubKey();

  const chain = await provider.getChainId();

  const expires = BigInt(Math.floor(Date.now() / 1000) + 24 * 60 * 60); // 24 hours from now

  const policyManager = new PolicyManager([
    { contractAddress: counterAddress, selector: "increment" },
    { contractAddress: counterAddress, selector: "increment_by" },
  ]);

  // Step 2: Create a session key module that can be used to request a session
  // key and to create a SmartrAccount with the signed session key that can
  // execute transactions as any regular Account
  const sessionKeyModule = new SessionKeyModule(
    sessionkeyPublicKey,
    accountAddress,
    sessionkeyClassHash("SessionKeyValidator"),
    chain,
    `0x${expires.toString(16)}`,
    policyManager
  );

  // Step 3: Generate the sessionkey grant request
  // that is an important step to request a session key because that is when
  // the core validator class is registered with the session key module
  const request = await sessionKeyModule.request(classHash("StarkValidator"));
  console.log("request", request);

  // Step 4: Use the SessionKeyGrantor helper class to sign the request
  const grantor = new SessionKeyGrantor(
    classHash("StarkValidator"),
    smartrAccountPrivateKey
  );
  const signature = await grantor.sign(sessionKeyModule);

  // Step 5: Register the signatures to the session key module
  sessionKeyModule.add_signature(signature);

  // Step 6: Create the SmartrAccount with the session key module
  const smartrAccountWithSessionKey = new SmartrAccount(
    provider,
    accountAddress,
    sessionkeyPrivateKey,
    sessionKeyModule
  );

  // Step 7: Execute transactions with the session key module
  const counter = new Contract(
    CounterABI,
    counterAddress,
    smartrAccountWithSessionKey
  );
  let currentCounter = await counter.call("get");
  console.log("currentCounter", currentCounter);
  const call = counter.populate("increment");
  const { transaction_hash } = await smartrAccountWithSessionKey.execute(call);
  const receipt = await smartrAccountWithSessionKey.waitForTransaction(
    transaction_hash
  );
  console.log("transaction succeeded", receipt.isSuccess());
  currentCounter = await counter.call("get");
  console.log("currentCounter", currentCounter);
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
