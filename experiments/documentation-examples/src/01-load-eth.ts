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
} from "@0xknwn/starknet-modular-account";
import { ABI as ERC20ABI } from "./abi/ERC20";

// these are the settings for the devnet with --seed=0
// change them to mee your requirements
const providerURL = "http://127.0.0.1:5050/rpc";
const ozAccountAddress =
  "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691";
const ozPrivateKey = "0x71d7bb07b9a64f6f78ac4c816aff4da9";
const smartrAccountPrivateKey = "0x1";
const ethAddress =
  "0x49D36570D4E46F48E99674BD3FCC84644DDD6B96F7C741B1562B82F9E004DC7";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const account = new Account(provider, ozAccountAddress, ozPrivateKey);
  const smartrSigner = new Signer(smartrAccountPrivateKey);
  const smartrAccountPublicKey = await smartrSigner.getPubKey();
  const starkValidatorClassHash = classHash("StarkValidator");
  const calldata = new CallData(SmartrAccountABI).compile("constructor", {
    core_validator: starkValidatorClassHash,
    public_key: [smartrAccountPublicKey],
  });
  const smartrAccountAddress = accountAddress(
    "SmartrAccount",
    smartrAccountPublicKey,
    calldata
  );
  const ETH = new Contract(ERC20ABI, ethAddress, account);
  const initial_EthTransfer = cairo.uint256(3n * 10n ** 15n);
  const call = ETH.populate("transfer", {
    recipient: smartrAccountAddress,
    amount: initial_EthTransfer,
  });
  const { transaction_hash } = await account.execute(call);
  const output = await account.waitForTransaction(transaction_hash);
  if (!output.isSuccess()) {
    throw new Error("Could not send ETH to the expected address");
  }
  console.log("accountAddress", smartrAccountAddress);
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
