import {
  testAccounts,
  default_timeout,
  config,
  initial_EthTransfer,
  ETH,
} from "tests-starknet-helpers";
import {
  declareClass as declareAccountClass,
  classHash as accountClassHash,
  SmartrAccount,
  deployAccount,
  accountAddress,
} from "@0xknwn/starknet-modular-account";
import { RpcProvider, CallData } from "starknet";
import { CoreValidatorABI } from "@0xknwn/starknet-modular-account";

describe("module management", () => {
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
      const c = await declareAccountClass(a, "CoreValidator");
      expect(c.classHash).toEqual(accountClassHash("CoreValidator"));
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
      const coreValidatorClassHash = accountClassHash("CoreValidator");
      const address = accountAddress("SmartrAccount", publicKey, [
        coreValidatorClassHash,
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
      const coreValidatorClassHash = accountClassHash("CoreValidator");
      const address = await deployAccount(
        smartrAccount,
        "SmartrAccount",
        publicKey,
        [coreValidatorClassHash, publicKey]
      );
      expect(address).toEqual(
        accountAddress("SmartrAccount", publicKey, [
          coreValidatorClassHash,
          publicKey,
        ])
      );
    },
    default_timeout
  );

  it(
    "checks the SmartAccount public keys",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const calldata = new CallData(CoreValidatorABI);
      const data = calldata.compile("get_public_keys", {});
      const c = await smartrAccount.callOnModule(
        accountClassHash("CoreValidator"),
        "get_public_keys",
        data
      );
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
    },
    default_timeout
  );

  it(
    "checks module 0x0 is not installed",
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const output = await smartrAccount.isModule("0x0");
      expect(output).toBe(false);
    },
    default_timeout
  );

  it(
    "deploys the SimpleValidator class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareAccountClass(a, "SimpleValidator");
      expect(c.classHash).toEqual(accountClassHash("SimpleValidator"));
    },
    default_timeout
  );

  it(
    "adds a module to the account",
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const { transaction_hash } = await smartrAccount.addModule(
        accountClassHash("SimpleValidator")
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "checks the SimpleValidator is installed",
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const output = await smartrAccount.isModule(
        accountClassHash("SimpleValidator")
      );
      expect(output).toBe(true);
    },
    default_timeout
  );

  it(
    "adds a module to the account again and fails",
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      try {
        await smartrAccount.addModule(accountClassHash("SimpleValidator"));
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
    },
    default_timeout
  );

  it(
    "removes the module from the account",
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const { transaction_hash } = await smartrAccount.removeModule(
        accountClassHash("SimpleValidator")
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "checks the SimpleValidator is not installed",
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const output = await smartrAccount.isModule(
        accountClassHash("SimpleValidator")
      );
      expect(output).toBe(false);
    },
    default_timeout
  );
});
