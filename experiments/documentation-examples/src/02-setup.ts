import { Account, Contract, RpcProvider, Signer, cairo } from "starknet";
import {
  accountAddress,
  declareClass,
} from "@0xknwn/starknet-modular-account";
import { ABI as ERC20ABI } from "./abi/ERC20";

const ozAccountAddress =
  "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691";
const ozPrivateKey = "0x71d7bb07b9a64f6f78ac4c816aff4da9";
const providerURL = "http://127.0.0.1:5050/rpc";
const smartrAccountPrivateKey = "0x1";
const ethAddress =
  "0x49D36570D4E46F48E99674BD3FCC84644DDD6B96F7C741B1562B82F9E004DC7";

const main = async () => {
  // setup constants
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const account = new Account(provider, ozAccountAddress, ozPrivateKey);

  // declare the classes
  const { classHash: smartrAccountClassHash } = await declareClass(
    account,
    "SmartrAccount"
  );
  const { classHash: coreValidatorClassHash } = await declareClass(
    account,
    "CoreValidator"
  );

  // load ETH
  const smartrSigner = new Signer(smartrAccountPrivateKey);
  const smartrAccountPublicKey = await smartrSigner.getPubKey();
  const smartrAccountAddress = accountAddress(
    "SmartrAccount",
    smartrAccountPublicKey,
    [coreValidatorClassHash, smartrAccountPublicKey]
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

  // deploy the Counter contract
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
