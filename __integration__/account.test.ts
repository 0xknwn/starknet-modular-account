import { deployClass } from "./class";
import {
  accountAddress,
  deployAccount,
  get_threshold,
  get_public_keys,
  add_public_key,
  remove_public_key,
} from "./account";
import { config, account, classHash, provider } from "./utils";
import {
  reset,
  increment,
  get,
  deployCounterContract,
  counterAddress,
} from "./counter";
import { Account } from "starknet";
import { timeout } from "./constants";

describe("account management", () => {
  let env: string;
  beforeAll(() => {
    env = "devnet";
  });

  it(
    "deploys the Counter class",
    async () => {
      const c = await deployClass("Counter");
      expect(c.classHash).toEqual(classHash("Counter"));
    },
    timeout
  );

  it(
    "deploys the counter contract",
    async () => {
      const c = await deployCounterContract();
      expect(c.address).toEqual(counterAddress(env));
    },
    timeout
  );

  it(
    "deploys the Account class",
    async () => {
      const c = await deployClass("Account");
      expect(c.classHash).toEqual(classHash("Account"));
    },
    timeout
  );

  it(
    "deploys the account contract",
    async () => {
      const conf = config(env);
      const c = await deployAccount("Account");
      expect(c).toEqual(accountAddress("Account", env));
    },
    timeout
  );

  it(
    "checks the account public keys",
    async () => {
      const conf = config(env);
      const a = account(0, env);
      const c = await get_public_keys(a, "Account", env);
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
    },
    timeout
  );

  it(
    "checks the account threshold",
    async () => {
      const a = account(0, env);
      const c = await get_threshold(a);
      expect(c).toEqual(1n);
    },
    timeout
  );

  it(
    "resets the counter with owner",
    async () => {
      const a = account(0, env);
      await reset(a);
    },
    timeout
  );

  it(
    "reads the counter",
    async () => {
      const a = account(0, env);
      const c = await get(a);
      expect(c).toBe(0n);
    },
    timeout
  );

  it(
    "increments the counter",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Account(
        p,
        accountAddress("Account", env),
        conf.accounts[0].privateKey
      );
      const c = await increment(a);
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "reads the counter",
    async () => {
      const a = account(0, env);
      const c = await get(a);
      expect(c).toBe(1n);
    },
    timeout
  );

  it(
    "increments and fails to reset the counter",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Account(
        p,
        accountAddress("Account", env),
        conf.accounts[0].privateKey
      );
      const c = await increment(a);
      try {
        await reset(a);
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
    },
    timeout
  );

  it(
    "reads the counter",
    async () => {
      const a = account(0, env);
      const c = await get(a);
      expect(c).toBe(2n);
    },
    timeout
  );

  it(
    "adds/checks a new public key",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Account(
        p,
        accountAddress("Account", env),
        conf.accounts[0].privateKey
      );
      await add_public_key(a, conf.accounts[1].publicKey, "Account", env);
      const c = await get_public_keys(a, "Account", env);
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(2);
      expect(`0x${c[1].toString(16)}`).toEqual(conf.accounts[1].publicKey);
    },
    timeout
  );

  it(
    "resets and increments the counter",
    async () => {
      const acc = account(0, env);
      await reset(acc);
      const conf = config(env);
      const p = provider(env);
      const a = new Account(
        p,
        accountAddress("Account", env),
        conf.accounts[1].privateKey
      );
      const c1 = await increment(a);
      expect(c1.isSuccess()).toEqual(true);
      const c2 = await get(a);
      expect(c2).toBe(1n);
    },
    timeout
  );

  it(
    "adds an already registered key to the account",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Account(
        p,
        accountAddress("Account", env),
        conf.accounts[0].privateKey
      );
      try {
        await add_public_key(a, conf.accounts[1].publicKey, "Account", env);
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
      const c = await get_public_keys(a, "Account", env);
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(2);
      expect(`0x${c[1].toString(16)}`).toEqual(conf.accounts[1].publicKey);
    },
    timeout
  );

  it(
    "removes a key from the account",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Account(
        p,
        accountAddress("Account", env),
        conf.accounts[0].privateKey
      );
      await remove_public_key(a, conf.accounts[1].publicKey);
      const c = await get_public_keys(a, "Account", env);
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
    },
    timeout
  );

  it(
    "removes a not registered key from the account",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Account(
        p,
        accountAddress("Account", env),
        conf.accounts[0].privateKey
      );
      try {
        await remove_public_key(a, "0x2");
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
    },
    timeout
  );

  it(
    "checks the former account key cannot be used anymore",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Account(
        p,
        accountAddress("Account", env),
        conf.accounts[1].privateKey
      );
      try {
        await increment(a);
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
      const acc = account(0, env);
      const c2 = await get(acc);
      expect(c2).toBe(1n);
    },
    timeout
  );

  it(
    "removes the last key from an account",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Account(
        p,
        accountAddress("Account", env),
        conf.accounts[0].privateKey
      );
      try {
        await remove_public_key(a, conf.accounts[0].privateKey);
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
      const c = await get_public_keys(a, "Account", env);
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
    },
    timeout
  );
});
