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
} from "@0xknwn/starknet-modular-account";
import { StarkValidatorABI } from "@0xknwn/starknet-modular-account";
import { RpcProvider, num, CallData } from "starknet";

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
      const address = accountAddress("SmartrAccount", publicKey, [
        starkValidatorClassHash,
        "0x1", 
        publicKey,
      ]);
      const { transaction_hash } = await ETH(sender).transfer(
        address,
        initial_EthTransfer
      );
      let receipt = await sender.waitForTransaction(transaction_hash);
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
      const address = await deployAccount(
        smartrAccount,
        "SmartrAccount",
        publicKey,
        [starkValidatorClassHash, "0x1", publicKey]
      );
      expect(address).toEqual(
        accountAddress("SmartrAccount", publicKey, [
          starkValidatorClassHash,
          "0x1", 
          publicKey,
        ])
      );
    },
    default_timeout
  );

  it(
    "adds a SmartAccount public keys",
    async () => {
      const conf = config(env);
      const calldata = new CallData(StarkValidatorABI);
      const data = calldata.compile("add_public_key", {
        new_public_key: conf.accounts[1].publicKey,
      });
      const { transaction_hash } = await smartrAccount.executeOnModule(
        accountClassHash("StarkValidator"),
        "add_public_key",
        data
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "checks the SmartAccount new public keys",
    async () => {
      const conf = config(env);

      const calldata = new CallData(StarkValidatorABI);
      const data = calldata.compile("get_public_keys", {});
      const output = await smartrAccount.callOnModule(
        accountClassHash("StarkValidator"),
        "get_public_keys",
        data
      );
      expect(Array.isArray(output)).toBe(true);
      expect(output.length).toEqual(2);
      expect(`0x${num.toBigInt(output[1]).toString(16)}`).toEqual(
        conf.accounts[1].publicKey
      );
    },
    default_timeout
  );

  it(
    "removes a SmartAccount public keys",
    async () => {
      const conf = config(env);
      const calldata = new CallData(StarkValidatorABI);
      const data = calldata.compile("remove_public_key", {
        old_public_key: conf.accounts[1].publicKey,
      });
      const { transaction_hash } = await smartrAccount.executeOnModule(
        accountClassHash("StarkValidator"),
        "remove_public_key",
        data
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "checks the SmartAccount new public keys",
    async () => {
      const conf = config(env);

      const calldata = new CallData(StarkValidatorABI);
      const data = calldata.compile("get_public_keys", {});
      const output = await smartrAccount.callOnModule(
        accountClassHash("StarkValidator"),
        "get_public_keys",
        data
      );
      expect(Array.isArray(output)).toBe(true);
      expect(output.length).toEqual(1);
      expect(`0x${num.toBigInt(output[0]).toString(16)}`).toEqual(
        conf.accounts[0].publicKey
      );
    },
    default_timeout
  );
});
