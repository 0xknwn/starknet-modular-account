// file src/01-deploy-account.ts
import { RpcProvider, Account, Signer, Contract, cairo } from "starknet";
import {
  accountAddress,
  classHash,
  deployAccount,
  SmartrAccount,
} from "@0xknwn/starknet-modular-account";

// these are the settings for the devnet with --seed=0
// change them to mee your requirements
const providerURL = "http://127.0.0.1:5050/rpc";
const smartrAccountPrivateKey = "0x1";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const smartrSigner = new Signer(smartrAccountPrivateKey);
  const smartrAccountPublicKey = await smartrSigner.getPubKey();
  const coreValidatorClassHash = classHash("CoreValidator");
  const smartrAccountAddress = accountAddress(
    "SmartrAccount",
    smartrAccountPublicKey,
    [coreValidatorClassHash, smartrAccountPublicKey]
  );
  const smartrAccount = new SmartrAccount(
    provider,
    smartrAccountAddress,
    smartrAccountPrivateKey
  );
  const address = await deployAccount(
    smartrAccount,
    "SmartrAccount",
    smartrAccountPublicKey,
    [coreValidatorClassHash, smartrAccountPublicKey]
  );
  if (address !== smartrAccountAddress) {
    throw new Error(
      `The account should have been deployed to ${smartrAccountAddress}, instead ${address}`
    );
  }
  console.log("accountAddress", smartrAccountAddress);
  console.log("public key", smartrAccountPublicKey);
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
