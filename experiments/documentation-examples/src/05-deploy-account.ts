// file src/05-deploy-account.ts
import { RpcProvider, Contract, cairo, hash, Account } from "starknet";
import {
  accountAddress,
  deployAccount,
  SmartrAccount,
} from "@0xknwn/starknet-modular-account";
import {
  classHash as P256ClassHash,
  P256Signer,
} from "@0xknwn/starknet-module";
import { init } from "./05-init";
import { ABI as ERC20ABI } from "./abi/ERC20";
const strkAddress =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

// these are the settings for the devnet with --seed=0
// change them to mee your requirements
const providerURL = "http://127.0.0.1:5050/rpc";
const p256PrivateKey =
  "0x1efecf7ee1e25bb87098baf2aaab0406167aae0d5ea9ba0d31404bf01886bd0e";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const { ozAccountAddress, ozAccountPrivateKey } = await init();

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
    [P256ClassHash("P256Validator"), "0x4", ...publicKeyArray]
  );

  // Step 3 - Send STRK to the computed account address
  const account = new Account(
    provider,
    ozAccountAddress,
    ozAccountPrivateKey,
    "1",
    "0x3"
  );
  const STRK = new Contract(ERC20ABI, strkAddress, account);
  const initial_strkTransfer = cairo.uint256(50000n * 10n ** 15n);
  const { transaction_hash } = await STRK.transfer(
    computedAccountAddress,
    initial_strkTransfer
  );
  const output = await account.waitForTransaction(transaction_hash);
  if (!output.isSuccess()) {
    throw new Error("Could not send STRK to the expected address");
  }

  // Step 4 - Deploy the account with the P256Validator as Core Validator
  const p256Account = new SmartrAccount(
    provider,
    computedAccountAddress,
    p236SmartrSigner,
    undefined,
    "1",
    "0x3"
  );
  const address = await deployAccount(
    p256Account,
    "SmartrAccount",
    publicKeyHash,
    [P256ClassHash("P256Validator"), "0x4", ...publicKeyArray],
    {
      version: "0x3",
      resourceBounds: {
        l2_gas: {
          max_amount: "0x0",
          max_price_per_unit: "0x0",
        },
        l1_gas: {
          max_amount: "0x2f10",
          max_price_per_unit: "0x22ecb25c00",
        },
      },
    }
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
