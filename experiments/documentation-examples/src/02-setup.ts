import {
  Account,
  Contract,
  RpcProvider,
  Signer,
  cairo,
  CallData,
} from "starknet";
import {
  accountAddress,
  declareClass,
  SmartrAccount,
  deployAccount,
  SmartrAccountABI,
  classNames,
} from "@0xknwn/starknet-modular-account";
import { ABI as ERC20ABI } from "./abi/ERC20";
import {
  declareClass as helperDeclareClass,
  deployCounter,
  classNames as helperClassNames,
} from "@0xknwn/starknet-test-helpers";

const ozAccountAddress =
  "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691";
const ozPrivateKey = "0x71d7bb07b9a64f6f78ac4c816aff4da9";
const providerURL = "http://127.0.0.1:5050/rpc";
const smartrAccountPrivateKey = "0x1";
const strkAddress =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

const main = async () => {
  // setup constants
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const account = new Account(
    provider,
    ozAccountAddress,
    ozPrivateKey,
    "1",
    "0x3"
  );

  // declare the classes
  await declareClass(account, classNames.SmartrAccount);
  const { classHash: starkValidatorClassHash } = await declareClass(
    account,
    classNames.StarkValidator
  );

  // load ETH
  const smartrSigner = new Signer(smartrAccountPrivateKey);
  const smartrAccountPublicKey = await smartrSigner.getPubKey();
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
  const initial_StrkTransfer = cairo.uint256(50000n * 10n ** 15n);
  const call = STRK.populate("transfer", {
    recipient: smartrAccountAddress,
    amount: initial_StrkTransfer,
  });
  const { transaction_hash } = await account.execute(call);
  const output = await account.waitForTransaction(transaction_hash);
  if (!output.isSuccess()) {
    throw new Error("Could not send STRK to the expected address");
  }

  // deploy the account
  const smartrAccount = new SmartrAccount(
    provider,
    smartrAccountAddress,
    smartrAccountPrivateKey,
    undefined,
    "1",
    "0x3"
  );
  const address = await deployAccount(
    smartrAccount,
    classNames.SmartrAccount,
    smartrAccountPublicKey,
    calldata
  );
  if (address !== smartrAccountAddress) {
    throw new Error(
      `The account should have been deployed to ${smartrAccountAddress}, instead ${address}`
    );
  }

  // deploy the Counter contract
  const { classHash: counterClassHash } = await helperDeclareClass(
    account,
    helperClassNames.Counter
  );
  const counter = await deployCounter(account, account.address);
  console.log("Account address:", smartrAccountAddress);
  console.log("Counter class hash:", counterClassHash);
  console.log("Counter address:", counter.address);
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
