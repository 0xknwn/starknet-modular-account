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
import { failedAccountAddress, deployFailedAccount } from "./failed_account";
import { Account, RpcProvider } from "starknet";

describe("sessionkey management", () => {
  let env: string;
  let counter: Counter;
  let failedAccount: Account;

  beforeAll(() => {
    env = "devnet";
  });

  it(
    "declare the Counter class",
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[0];
      const c = await declareClass(account, "Counter");
      expect(c.classHash).toEqual(classHash("Counter"));
    },
    default_timeout
  );

  it(
    "deploys the Counter contract",
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[0];
      const c = await deployCounter(account, account.address);
      expect(c.address).toEqual(
        await counterAddress(account.address, account.address)
      );
      counter = new Counter(c.address, testAccounts(conf)[0]);
    },
    default_timeout
  );

  it(
    "declares the FailedAccount class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareClass(a, "FailedAccount");
      expect(c.classHash).toEqual(classHash("FailedAccount"));
    },
    default_timeout
  );

  it(
    "deploys the account",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const publicKey = conf.accounts[0].publicKey;
      const c = await deployFailedAccount(a, publicKey);
      expect(c).toEqual(failedAccountAddress(conf.accounts[0].publicKey));
      failedAccount = new Account(
        new RpcProvider({ nodeUrl: conf.providerURL }),
        failedAccountAddress(conf.accounts[0].publicKey),
        conf.accounts[0].privateKey
      );
    },
    default_timeout
  );

  it(
    "resets the counter",
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[0];
      if (!counter) {
        throw new Error("Counter not deployed");
      }
      const { transaction_hash } = await counter.reset();
      const receipt = await account.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "increments the counter from FailedAccount and succeed",
    async () => {
      if (!counter) {
        throw new Error("Counter not deployed");
      }
      if (!failedAccount) {
        throw new Error("failedAccount not installed");
      }
      const counterWithFailedAccount = new Counter(
        counter.address,
        failedAccount
      );
      const { transaction_hash } = await counterWithFailedAccount.increment();
      const receipt = await failedAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "reads the counter",
    async () => {
      if (!counter) {
        throw new Error("Counter not deployed");
      }
      const c = await counter.get();
      expect(c).toBeGreaterThan(0n);
    },
    default_timeout
  );

  it(
    "resets the counter",
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[0];
      if (!counter) {
        throw new Error("Counter not deployed");
      }
      const { transaction_hash } = await counter.reset();
      const receipt = await account.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "increments the counter from FailedAccount and fails",
    async () => {
      if (!counter) {
        throw new Error("Counter not deployed");
      }
      if (!failedAccount) {
        throw new Error("failedAccount not installed");
      }
      const counterWithFailedAccount = new Counter(
        counter.address,
        failedAccount
      );
      try {
        const { transaction_hash } = await counterWithFailedAccount.increment();
        const receipt =
          await failedAccount.waitForTransaction(transaction_hash);
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
    },
    default_timeout
  );

  it(
    "reads the counter",
    async () => {
      if (!counter) {
        throw new Error("Counter not deployed");
      }
      const c = await counter.get();
      expect(c).toBe(0n);
    },
    default_timeout
  );
});
