// file src/06-declare-class.ts
import { RpcProvider, Account } from "starknet";
import { declareClass } from "@0xknwn/starknet-module-sessionkey";

// these are the settings for the devnet with --seed=0
// change them to mee your requirements
const providerURL = "http://127.0.0.1:5050/rpc";
const ozAccountAddress =
  "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691";
const ozPrivateKey = "0x71d7bb07b9a64f6f78ac4c816aff4da9";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const account = new Account(provider, ozAccountAddress, ozPrivateKey);

  const { classHash: sessionkeyValidatorClassHash } = await declareClass(
    account,
    "SessionKeyValidator"
  );
  console.log("SessionKeyValidator class hash:", sessionkeyValidatorClassHash);
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
