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
} from "@0xknwn/starknet-modular-account";
import { ABI as ERC20ABI } from "./abi/ERC20";
import {
  declareClass as helperDeclareClass,
  deployCounter,
} from "@0xknwn/starknet-test-helpers";

const ozAccountAddress =
  "0x3b2d6d0edcbdbdf6548d2b79531263628887454a0a608762c71056172d36240";
const ozPrivateKey =
  "0x000e8f079f1092042bf9b855935d3ef1bb7078609491fb24e7cb8cbb574e50ca";
const providerURL = "https://starknet-sepolia.public.blastapi.io";
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
  const { classHash: starkValidatorClassHash } = await declareClass(
    account,
    "StarkValidator"
  );

  // load ETH
  const smartrSigner = new Signer(smartrAccountPrivateKey);
  const smartrAccountPublicKey = await smartrSigner.getPubKey();
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
  const initial_EthTransfer = cairo.uint256(6n * 10n ** 15n);
  const call = ETH.populate("transfer", {
    recipient: smartrAccountAddress,
    amount: initial_EthTransfer,
  });
  const { transaction_hash } = await account.execute(call);
  const output = await account.waitForTransaction(transaction_hash);
  if (!output.isSuccess()) {
    throw new Error("Could not send ETH to the expected address");
  }

  // deploy the account
  const smartrAccount = new SmartrAccount(
    provider,
    smartrAccountAddress,
    smartrAccountPrivateKey
  );
  const address = await deployAccount(
    smartrAccount,
    "SmartrAccount",
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
    "Counter"
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
