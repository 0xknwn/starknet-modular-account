import { Signer } from "starknet";
import { accountAddress, classHash } from "@0xknwn/starknet-modular-account";
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
  const coreValidatorClassHash = classHash("CoreValidator");
  const smartrAccountAddress = accountAddress(
    "SmartrAccount",
    smartrAccountPublicKey,
    [coreValidatorClassHash, smartrAccountPublicKey]
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
