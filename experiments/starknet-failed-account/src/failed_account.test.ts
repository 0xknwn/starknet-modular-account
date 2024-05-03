import {
  declareClass as declareHelperClass,
  classHash as helperClassHash,
  deployCounter,
  testAccounts,
  default_timeout,
  Counter,
  counterAddress,
  config,
  ETH,
  initial_EthTransfer,
} from "@0xknwn/starknet-test-helpers";
import {
  classHash as failedClassHash,
  declareClass as declareFailedClass,
} from "./class";
import { deployAccount } from "./contract";
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
      const c = await declareHelperClass(account, "Counter");
      expect(c.classHash).toEqual(helperClassHash("Counter"));
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
      const c = await declareFailedClass(a, "FailedAccount");
      expect(c.classHash).toEqual(failedClassHash("FailedAccount"));
    },
    default_timeout
  );

  it(
    "sends ETH to the FailedAccount address",
    async () => {
      const conf = config(env);
      const sender = testAccounts(conf)[0];
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const publicKey = conf.accounts[0].publicKey;
      const privateKey = conf.accounts[0].privateKey;
      const address = failedAccountAddress(publicKey);
      const { transaction_hash } = await ETH(sender).transfer(
        address,
        initial_EthTransfer
      );
      let receipt = await sender.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toEqual(true);
      failedAccount = new Account(p, address, privateKey);
    },
    default_timeout
  );

  it(
    "deploys the FailedAccount account",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const publicKey = conf.accounts[0].publicKey;
      const address = await deployAccount(
        failedAccount,
        "FailedAccount",
        publicKey,
        [publicKey]
      );
      expect(address).toEqual(failedAccount.address);
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
        const receipt = await failedAccount.waitForTransaction(
          transaction_hash
        );
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
