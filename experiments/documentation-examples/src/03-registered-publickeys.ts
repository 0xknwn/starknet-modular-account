// file src/03-registered-publickeys.ts
import { SmartrAccount } from "@0xknwn/starknet-modular-account";
import {
  MultisigValidatorABI,
  classHash as moduleClassHash,
} from "@0xknwn/starknet-module";
import { init } from "./03-init";
import { CallData, RpcProvider } from "starknet";

const providerURL = "http://127.0.0.1:5050/rpc";

const main = async () => {
  const provider = new RpcProvider({ nodeUrl: providerURL });
  const { accountAddress, smartrAccountPrivateKey } = await init();
  const account = new SmartrAccount(
    provider,
    accountAddress,
    smartrAccountPrivateKey
  );
  const moduleCallData = new CallData(MultisigValidatorABI);
  const calldata = moduleCallData.compile("get_public_keys", {});
  const publickeysList = await account.callOnModule(
    moduleClassHash("MultisigValidator"),
    "get_public_keys",
    calldata
  );
  console.log("number of public keys for module", publickeysList.length);
  publickeysList.forEach((publickey, idx) => {
    console.log("publickey #", idx + 1, `0x${publickey.toString(16)}`);
  });
};

main()
  .then(() => {})
  .catch((e) => {
    console.warn(e);
  });
