import { Signer, CallData } from "starknet";
import {
  accountAddress,
  classHash,
  SmartrAccountABI,
} from "@0xknwn/starknet-modular-account";
import {
  counterAddress as helperCounterAddress,
  CounterABI,
} from "@0xknwn/starknet-test-helpers";

const ozAccountAddress =
  "0x3b2d6d0edcbdbdf6548d2b79531263628887454a0a608762c71056172d36240";
const smartrAccountPrivateKey = "0x1";

export { CounterABI };
export const init = async () => {
  // compute the smartrAccount details
  const smartrSigner = new Signer(smartrAccountPrivateKey);
  const smartrAccountPublicKey = await smartrSigner.getPubKey();
  const starkValidatorClassHash = classHash("StarkValidator");
  const calldata = new CallData(SmartrAccountABI).compile("constructor", {
    core_validator: starkValidatorClassHash,
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
