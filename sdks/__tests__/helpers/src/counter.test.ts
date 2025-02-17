import { testAccounts, config } from "./utils";
import { deployCounter, counterAddress, CounterABI } from "./counter";
import { default_timeout } from "./parameters";
import {
  Contract,
  type Call,
  RpcProvider,
  Account,
  UniversalDetails,
} from "starknet";

import { data } from "./data.fixture";

describe.each(data)(
  "counter contract (helper)",
  ({ fees, version, accountID }) => {
    let env: string;
    let counter: Contract;
    let altURL: string;
    const redeployCounter = async (
      account: Account,
      details?: UniversalDetails
    ) => {
      if (!counter) {
        counter = await deployCounter(account, account.address, details);
      }
    };

    beforeAll(() => {
      env = "devnet";
      const conf = config(env);
      // altURL = "http://localhost:8080";
      if (!altURL) {
        altURL = conf.providerURL;
      }
    });

    it(
      `[${fees}] deploys the Counter contract`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        const c = await deployCounter(account, account.address, {
          version: version.invoke,
        });
        expect(c.address).toEqual(
          await counterAddress(account.address, account.address)
        );
        counter = c;
      },
      default_timeout
    );

    it(
      `[${fees}] increments the counter`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        redeployCounter(account, { version: version.invoke });
        const transferCall: Call = counter.populate("increment", {});
        const { transaction_hash } = await account.execute(transferCall, {
          version: version.invoke,
        });
        const receipt = await account.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    it(
      `[${fees}] reads the counter`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        redeployCounter(account, { version: version.invoke });
        const c = await counter.get();
        expect(c).toBeGreaterThan(0n);
      },
      default_timeout
    );

    it(
      `[${fees}] increments the counter by 5 and 6`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        redeployCounter(account, { version: version.invoke });
        const transferCall: Call = counter.populate("increment_by_array", {
          args: [5, 6],
        });
        const { transaction_hash } = await account.execute(transferCall, {
          version: version.invoke,
        });
        const receipt = await account.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    it(
      `[${fees}] reads the counter again`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        redeployCounter(account, { version: version.invoke });
        const c = await counter.get();
        expect(c).toBeGreaterThan(11n);
      },
      default_timeout
    );

    it(
      `[${fees}] resets the counter`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        redeployCounter(account, { version: version.invoke });
        const transferCall: Call = counter.populate("reset", {});
        const { transaction_hash } = await account.execute(transferCall, {
          version: version.invoke,
        });
        const receipt = await account.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    it(
      `[${fees}] reads the counter again`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        redeployCounter(account, { version: version.invoke });
        const c = await counter.get();
        expect(c).toBe(0n);
      },
      default_timeout
    );

    it(
      `[${fees}] increments the counter from another account`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[2];
        redeployCounter(account, { version: version.invoke });
        const transferCall: Call = counter.populate("increment", {});
        const { transaction_hash } = await account.execute(transferCall, {
          version: version.invoke,
        });
        const receipt = await account.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    it(
      `[${fees}] reads the counter`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        redeployCounter(account, { version: version.invoke });
        const c = await counter.get();
        expect(c).toBeGreaterThan(0n);
      },
      default_timeout
    );

    it(
      `[${fees}] resets the counter and fails`,
      async () => {
        const conf = config(env);
        let account = testAccounts(conf)[accountID];
        redeployCounter(account, { version: version.invoke });
        const transferCall: Call = counter.populate("reset", {});
        try {
          account = testAccounts(conf)[2];
          const { transaction_hash } = await account.execute(transferCall);
          await account.waitForTransaction(transaction_hash);
          expect(true).toBe(false);
        } catch (e) {
          expect(e).toBeDefined();
        }
      },
      default_timeout
    );

    it(
      `[${fees}] reads the counter again`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        redeployCounter(account, { version: version.invoke });
        const c = await counter.get();
        expect(c).toBeGreaterThan(0n);
      },
      default_timeout
    );

    it(
      `[${fees}] increments the counter with an alt provider URL`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        redeployCounter(account, { version: version.invoke });
        const provider = new RpcProvider({ nodeUrl: altURL });
        const a = new Account(
          provider,
          conf.accounts[accountID].address,
          conf.accounts[accountID].privateKey
        );
        const transferCall: Call = counter.populate("increment", {});
        const { transaction_hash } = await account.execute(transferCall, {
          version: version.invoke,
        });
        const receipt = await a.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    it(
      `[${fees}] reads the counter from an alt. provider URL`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        redeployCounter(account, { version: version.invoke });
        const provider = new RpcProvider({ nodeUrl: altURL });
        const altCounter = new Contract(
          CounterABI,
          counter.address,
          provider
        ).typedv2(CounterABI);
        const c = await altCounter.get();
        expect(c).toBeGreaterThan(0n);
      },
      default_timeout
    );
  }
);
