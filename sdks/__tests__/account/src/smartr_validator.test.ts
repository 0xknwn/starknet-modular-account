import {
  testAccounts,
  default_timeout,
  config,
  initial_EthTransfer,
  ETH,
} from "@0xknwn/starknet-test-helpers";
import {
  declareClass as declareAccountClass,
  classHash as accountClassHash,
  SmartrAccount,
  deployAccount,
  accountAddress,
  SmartrAccountABI,
} from "@0xknwn/starknet-modular-account";
import { StarkValidatorABI } from "@0xknwn/starknet-modular-account";
import { RpcProvider, num, CallData, shortString } from "starknet";

describe("call and execute on validator", () => {
  let env: string;
  let smartrAccount: SmartrAccount;

  beforeAll(() => {
    env = "devnet";
  });

  it(
    "deploys the starkValidator class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareAccountClass(a, "StarkValidator");
      expect(c.classHash).toEqual(accountClassHash("StarkValidator"));
    },
    default_timeout
  );

  it(
    "deploys the SmartrAccount class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareAccountClass(a, "SmartrAccount");
      expect(c.classHash).toEqual(accountClassHash("SmartrAccount"));
    },
    default_timeout
  );

  it(
    "sends ETH to the account address",
    async () => {
      const conf = config(env);
      const sender = testAccounts(conf)[0];
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const publicKey = conf.accounts[0].publicKey;
      const privateKey = conf.accounts[0].privateKey;
      const starkValidatorClassHash = accountClassHash("StarkValidator");
      const calldata = new CallData(SmartrAccountABI).compile("constructor", {
        core_validator: starkValidatorClassHash,
        args: [publicKey],
      });
      const address = accountAddress("SmartrAccount", publicKey, calldata);
      const { transaction_hash } = await ETH(sender).transfer(
        address,
        initial_EthTransfer
      );
      const receipt = await sender.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toEqual(true);
      smartrAccount = new SmartrAccount(p, address, privateKey);
    },
    default_timeout
  );

  it(
    "deploys a SmartrAccount account",
    async () => {
      const conf = config(env);
      const publicKey = conf.accounts[0].publicKey;
      const starkValidatorClassHash = accountClassHash("StarkValidator");
      const calldata = new CallData(SmartrAccountABI).compile("constructor", {
        core_validator: starkValidatorClassHash,
        args: [publicKey],
      });
      const address = await deployAccount(
        smartrAccount,
        "SmartrAccount",
        publicKey,
        calldata
      );
      expect(address).toEqual(
        accountAddress("SmartrAccount", publicKey, calldata)
      );
    },
    default_timeout
  );

  it(
    "checks the StarkValidator name",
    async () => {
      const conf = config(env);

      const calldata = new CallData(StarkValidatorABI);
      const data = calldata.compile("get_name", {});
      const output = await smartrAccount.callOnModule(
        accountClassHash("StarkValidator"),
        "get_name",
        data
      );
      expect(Array.isArray(output)).toBe(true);
      expect(output.length).toEqual(1);
      expect(`0x${num.toBigInt(output[0]).toString(16)}`).toEqual(
        shortString.encodeShortString("stark-validator")
      );
    },
    default_timeout
  );
});
