// file src/05-declare-p256-validator.ts
import { RpcProvider, Account } from "starknet";
import { declareClass } from "@0xknwn/starknet-module";

// these are the settings for the devnet with --seed=0
// change them to mee your requirements
const ozAccountAddress =
  "0x3b2d6d0edcbdbdf6548d2b79531263628887454a0a608762c71056172d36240";
const ozPrivateKey =
  "0x000e8f079f1092042bf9b855935d3ef1bb7078609491fb24e7cb8cbb574e50ca";
const providerURL = "https://starknet-sepolia.public.blastapi.io";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const account = new Account(provider, ozAccountAddress, ozPrivateKey);

  const { classHash: p256ValidatorClassHash } = await declareClass(
    account,
    "P256Validator"
  );
  console.log("P256Validator class hash:", p256ValidatorClassHash);
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
