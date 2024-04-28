import {
  declareClass,
  classHash,
  deployCounter,
  testAccounts,
  default_timeout,
  Counter,
  counterAddress,
  config,
} from "starknet-test-helpers";
import {
  SmartrAccount,
  deploySmartrAccount,
  smartrAccountAddress,
} from "./smartr_account";
import { ABI as SmartAccountABI } from "./abi/SmartrAccount";
import { ABI as CoreValidatorABI } from "./abi/CoreValidator";
import {
  Contract,
  RpcProvider,
  selector,
  num,
  CallData,
  type Call,
} from "starknet";
import { contractAddress } from "starknet-test-helpers/src/contract";

describe("call and execute on validator", () => {
  let env: string;
  let smartrAccount: SmartrAccount;

  beforeAll(() => {
    env = "devnet";
  });

  it(
    "deploys the coreValidator class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareClass(a, "CoreValidator");
      expect(c.classHash).toEqual(classHash("CoreValidator"));
    },
    default_timeout
  );

  it(
    "deploys the SmartrAccount class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareClass(a, "SmartrAccount");
      expect(c.classHash).toEqual(classHash("SmartrAccount"));
    },
    default_timeout
  );

  it(
    "deploys a SmartrAccount account",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const publicKey = conf.accounts[0].publicKey;
      const privateKey = conf.accounts[0].privateKey;
      const coreValidatorAddress = classHash("CoreValidator");
      const accountAddress = await deploySmartrAccount(
        a,
        publicKey,
        coreValidatorAddress
      );
      expect(accountAddress).toEqual(
        smartrAccountAddress(publicKey, coreValidatorAddress)
      );
      smartrAccount = new SmartrAccount(p, accountAddress, privateKey);
    },
    default_timeout
  );

  it(
    "adds a SmartAccount public keys",
    async () => {
      const conf = config(env);
      const p = new RpcProvider({ nodeUrl: conf.providerURL });

      const account = new Contract(
        SmartAccountABI,
        smartrAccount.address,
        p
      ).typedv2(SmartAccountABI);

      const calldata = new CallData(CoreValidatorABI);
      const data = calldata.compile("add_public_key", {
        new_public_key: conf.accounts[1].publicKey,
      });

      const transferCall: Call = account.populate("execute_on_module", {
        class_hash: classHash("CoreValidator"),
        call: {
          selector: selector.getSelectorFromName("add_public_key"),
          to: smartrAccount.address,
          calldata: data,
        },
      });
      const { transaction_hash } = await smartrAccount.execute(transferCall);
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "checks the SmartAccount new public keys",
    async () => {
      const conf = config(env);
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const account = new Contract(
        SmartAccountABI,
        smartrAccount.address,
        p
      ).typedv2(SmartAccountABI);
      const command = await account.call_on_module(classHash("CoreValidator"), {
        selector: selector.getSelectorFromName("get_public_keys"),
        to: smartrAccount.address,
        calldata: [],
      });
      expect(Array.isArray(command)).toBe(true);
      expect(command.length).toEqual(2);
      expect(`0x${num.toBigInt(command[1]).toString(16)}`).toEqual(
        conf.accounts[1].publicKey
      );
    },
    default_timeout
  );
});
