import { Account, Contract, RpcProvider, Signer } from "starknet";
import {
  accountAddress,
  classHash,
  SmartrAccount,
} from "@0xknwn/starknet-modular-account";

const ozAccountAddress =
  "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691";
const ozPrivateKey = "0x71d7bb07b9a64f6f78ac4c816aff4da9";
const providerURL = "http://127.0.0.1:5050/rpc";
const smartrAccountPrivateKey = "0x1";
export let smartrAccount: SmartrAccount;
export let counter: Contract;

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
  smartrAccount = new SmartrAccount(
    provider,
    smartrAccountAddress,
    smartrAccountPrivateKey
  );

  const account = new Account(provider, ozAccountAddress, ozPrivateKey);
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
