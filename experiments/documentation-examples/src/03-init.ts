import { Signer, CallData } from "starknet";
import {
  accountAddress,
  SmartrAccountABI,
} from "@0xknwn/starknet-modular-account";
import { classHash as moduleClassHash } from "@0xknwn/starknet-module";
import {
  counterAddress as helperCounterAddress,
  CounterABI,
} from "@0xknwn/starknet-test-helpers";

const ozAccountAddress =
  "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691";
const smartrAccountPrivateKey = "0x1";

export { CounterABI };
export const init = async () => {
  // compute the smartrAccount details
  const smartrSigner = new Signer(smartrAccountPrivateKey);
  const smartrAccountPublicKey = await smartrSigner.getPubKey();
  const multisigValidatorClassHash = moduleClassHash("MultisigValidator");
  const calldata = new CallData(SmartrAccountABI).compile("constructor", {
    core_validator: multisigValidatorClassHash,
    public_key: [smartrAccountPublicKey],
  });
  const smartrAccountAddress = accountAddress(
    "SmartrAccount",
    smartrAccountPublicKey,
    calldata
  );

  // compute the counter Address
  const counterAddress = await helperCounterAddress(
    ozAccountAddress,
    ozAccountAddress
  );
  return {
    accountAddress: smartrAccountAddress,
    counterAddress,
    smartrAccountPrivateKey,
    smartrAccountPublicKey,
  };
};
