// file src/01-using-account.ts
import { RpcProvider, Signer, CallData } from "starknet";
import {
  accountAddress,
  classHash,
  SmartrAccount,
  SmartrAccountABI,
  classNames,
} from "@0xknwn/starknet-modular-account";

// these are the settings for the devnet with --seed=0
// change them to mee your requirements
const providerURL = "http://127.0.0.1:5050/rpc";
const smartrAccountPrivateKey = "0x1";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const smartrSigner = new Signer(smartrAccountPrivateKey);
  const smartrAccountPublicKey = await smartrSigner.getPubKey();
  const starkValidatorClassHash = classHash(classNames.StarkValidator);
  const calldata = new CallData(SmartrAccountABI).compile("constructor", {
    core_validator: starkValidatorClassHash,
    args: [smartrAccountPublicKey],
  });
  const smartrAccountAddress = accountAddress(
    classNames.SmartrAccount,
    smartrAccountPublicKey,
    calldata
  );
  const smartrAccount = new SmartrAccount(
    provider,
    smartrAccountAddress,
    smartrAccountPrivateKey,
    undefined,
    "1",
    "0x3"
  );
  console.log("address", smartrAccount.address);
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
