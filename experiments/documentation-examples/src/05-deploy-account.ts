// file src/05-deploy-account.ts
import { RpcProvider, Contract, cairo, hash } from "starknet";
import {
  accountAddress,
  deployAccount,
  SmartrAccount,
} from "@0xknwn/starknet-modular-account";
import {
  classHash as moduleClassHash,
  P256Signer,
} from "@0xknwn/starknet-module";
import { init } from "./05-init";
import { ABI as ERC20ABI } from "./abi/ERC20";
const ethAddress =
  "0x49D36570D4E46F48E99674BD3FCC84644DDD6B96F7C741B1562B82F9E004DC7";

// these are the settings for the devnet with --seed=0
// change them to mee your requirements
const providerURL = "http://127.0.0.1:5050/rpc";
const p256PrivateKey =
  "0x1efecf7ee1e25bb87098baf2aaab0406167aae0d5ea9ba0d31404bf01886bd0e";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const { accountAddress: ozAccountAddress, smartrAccountPrivateKey } =
    await init();

  // Step 1 - Get the public key from the Eth Signer
  const p236SmartrSigner = new P256Signer(p256PrivateKey);
  const publicKey = await p236SmartrSigner.getPubKey();
  const coords = publicKey.slice(2, publicKey.length);
  const x = coords.slice(0, 64);
  const x_felts = cairo.uint256(`0x${x}`);
  const y = coords.slice(64, 128);
  const y_felts = cairo.uint256(`0x${y}`);
  const publicKeyArray = [
    x_felts.low.toString(),
    x_felts.high.toString(),
    y_felts.low.toString(),
    y_felts.high.toString(),
  ];

  // Step 2 - Compute the account address
  const publicKeyHash = hash.computeHashOnElements(publicKeyArray);
  const computedAccountAddress = accountAddress(
    "SmartrAccount",
    publicKeyHash,
    [moduleClassHash("P256Validator"), "0x4", ...publicKeyArray]
  );

  // Step 3 - Send ETH to the computed account address
  const account = new SmartrAccount(
    provider,
    ozAccountAddress,
    smartrAccountPrivateKey
  );
  const ETH = new Contract(ERC20ABI, ethAddress, account);
  const initial_EthTransfer = cairo.uint256(5n * 10n ** 15n);
  const call = ETH.populate("transfer", {
    recipient: computedAccountAddress,
    amount: initial_EthTransfer,
  });
  const { transaction_hash } = await account.execute(call);
  const output = await account.waitForTransaction(transaction_hash);
  if (!output.isSuccess()) {
    throw new Error("Could not send ETH to the expected address");
  }

  // Step 4 - Deploy the account with the P256Validator as Core Validator
  const p256Account = new SmartrAccount(
    provider,
    computedAccountAddress,
    p236SmartrSigner
  );
  const address = await deployAccount(
    p256Account,
    "SmartrAccount",
    publicKeyHash,
    [moduleClassHash("P256Validator"), "0x4", ...publicKeyArray]
  );
  if (address !== computedAccountAddress) {
    throw new Error(
      `The account should have been deployed to ${computedAccountAddress}, instead ${address}`
    );
  }
  console.log("accountAddress", computedAccountAddress);
  console.log("public key", publicKeyArray);
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
