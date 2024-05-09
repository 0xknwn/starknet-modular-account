// file src/05-get-publickey.ts
import { SmartrAccount } from "@0xknwn/starknet-modular-account";
import {
  classHash as moduleClassHash,
  P256ValidatorABI,
} from "@0xknwn/starknet-module";
import { init } from "./05-init";
import { CallData, RpcProvider } from "starknet";

const providerURL = "https://starknet-sepolia.public.blastapi.io";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const { accountAddress, smartrAccountPrivateKey } = await init();
  const account = new SmartrAccount(
    provider,
    accountAddress,
    smartrAccountPrivateKey
  );
  const moduleCallData = new CallData(P256ValidatorABI);
  const calldata = moduleCallData.compile("get_public_key", {});
  const public_keys = await account.callOnModule(
    moduleClassHash("P256Validator"),
    "get_public_key",
    calldata
  );
  public_keys.forEach((public_key, idx) =>
    console.log(`public key (${idx}):`, public_key)
  );
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
