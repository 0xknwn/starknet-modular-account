// file src/01-declare-class.ts
import { RpcProvider, Account } from "starknet";
import { declareClass } from "@0xknwn/starknet-modular-account";

// these are the settings for the devnet with --seed=0
// change them to mee your requirements
const providerURL = "http://127.0.0.1:5050/rpc";
const ozAccountAddress =
  "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691";
const ozPrivateKey = "0x71d7bb07b9a64f6f78ac4c816aff4da9";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const account = new Account(provider, ozAccountAddress, ozPrivateKey);

  const { classHash: smartrAccountClassHash } = await declareClass(
    account,
    "SmartrAccount"
  );
  console.log("smartrAccount class hash:", smartrAccountClassHash);

  const { classHash: starkValidatorClassHash } = await declareClass(
    account,
    "StarkValidator"
  );
  console.log("starkValidator class hash:", starkValidatorClassHash);
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
