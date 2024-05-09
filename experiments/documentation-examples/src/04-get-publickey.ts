// file src/04-get-publickey.ts
import { SmartrAccount } from "@0xknwn/starknet-modular-account";
import {
  EthValidatorABI,
  classHash as ethClassHash,
} from "@0xknwn/starknet-module-eth";
import { init } from "./04-init";
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
  const moduleCallData = new CallData(EthValidatorABI);
  const calldata = moduleCallData.compile("get_public_key", {});
  const public_keys = await account.callOnModule(
    ethClassHash("EthValidator"),
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
