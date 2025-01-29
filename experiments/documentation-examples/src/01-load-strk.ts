// file src/01-load-eth.ts
import {
  RpcProvider,
  Account,
  Signer,
  Contract,
  cairo,
  CallData,
} from "starknet";
import {
  accountAddress,
  classHash,
  SmartrAccountABI,
  classNames,
} from "@0xknwn/starknet-modular-account";
import { ABI as ERC20ABI } from "./abi/ERC20";

// these are the settings for the devnet with --seed=0
// change them to mee your requirements
const providerURL = "http://127.0.0.1:5050/rpc";
const ozAccountAddress =
  "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691";
const ozPrivateKey = "0x71d7bb07b9a64f6f78ac4c816aff4da9";
const smartrAccountPrivateKey = "0x1";
const strkAddress =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const account = new Account(
    provider,
    ozAccountAddress,
    ozPrivateKey,
    "1",
    "0x3"
  );
  const smartrSigner = new Signer(smartrAccountPrivateKey);
  const smartrAccountPublicKey = await smartrSigner.getPubKey();
  const starkValidatorClassHash = classHash(classNames.StarkValidator);
  const calldata = new CallData(SmartrAccountABI).compile("constructor", {
    core_validator: starkValidatorClassHash,
    args: [smartrAccountPublicKey],
  });
  const smartrAccountAddress = accountAddress(
    classNames.SmartrAccount,
    smartrAccountPublicKey,
    calldata
  );
  const STRK = new Contract(ERC20ABI, strkAddress, account);
  const initial_StrkTransfer = cairo.uint256(5000n * 10n ** 15n);
  const call = STRK.populate("transfer", {
    recipient: smartrAccountAddress,
    amount: initial_StrkTransfer,
  });
  const { transaction_hash } = await account.execute(call);
  const output = await account.waitForTransaction(transaction_hash);
  if (!output.isSuccess()) {
    throw new Error("Could not send STRK to the expected address");
  }
  console.log("accountAddress", smartrAccountAddress);
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
