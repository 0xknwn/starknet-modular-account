import { deployClass } from "./class";
import {
  accountAddress,
  deployAccount,
  get_threshold,
  get_public_keys,
  add_public_key,
  set_threshold,
  remove_public_key,
} from "./account";
import { config, classHash, account, provider } from "./utils";
import {
  reset,
  increment,
  get,
  deployCounterContract,
  counterAddress,
} from "./counter";
import { Multisig } from "./multisig";
import { timeout } from "./constants";

describe("multiple signatures", () => {
  let env: string;
  beforeAll(() => {
    env = "devnet";
  });

  it(
    "deploys the Counter class",
    async () => {
      const c = await deployClass("Counter", env);
      expect(c.classHash).toEqual(classHash("Counter"));
    },
    timeout
  );

  it(
    "deploys the counter contract",
    async () => {
      const c = await deployCounterContract(env);
      expect(c.address).toEqual(counterAddress(env));
    },
    timeout
  );

  it(
    "deploys the Account class",
    async () => {
      const c = await deployClass("Account", env);
      expect(c.classHash).toEqual(classHash("Account"));
    },
    timeout
  );

  it(
    "deploys the account",
    async () => {
      const c = await deployAccount("Account", env);
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
    "resets the counter with its owner",
    async () => {
      const a = account(0, env);
      await reset(a, env);
    },
    timeout
  );

  it(
    "reads the counter",
    async () => {
      const a = account(0, env);
      const c = await get(a, env);
      expect(c).toBe(0n);
    },
    timeout
  );

  it(
    "increments the counter",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Multisig(p, accountAddress("Account", env), [
        conf.accounts[0].privateKey,
      ]);
      const c = await increment(a, 1, env);
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "reads the counter",
    async () => {
      const a = account(0, env);
      const c = await get(a, env);
      expect(c).toBe(1n);
    },
    timeout
  );

  it(
    "adds/checks a new public key to the account",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Multisig(p, accountAddress("Account", env), [
        conf.accounts[0].privateKey,
      ]);
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
      await reset(acc, env);
      const conf = config(env);
      const p = provider(env);
      const a = new Multisig(p, accountAddress("Account", env), [
        conf.accounts[1].privateKey,
      ]);
      const c1 = await increment(a, 1, env);
      expect(c1.isSuccess()).toEqual(true);
      const c2 = await get(a, env);
      expect(c2).toBe(1n);
    },
    timeout
  );

  it(
    "updates the account threshold to 2",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Multisig(p, accountAddress("Account", env), [
        conf.accounts[1].privateKey,
      ]);
      const c1 = await set_threshold(a, 2n, "Account", env);
      expect(c1.isSuccess()).toEqual(true);
      const acc = account(0, env);
      const c = await get_threshold(acc, "Account", env);
      expect(c).toEqual(2n);
    },
    timeout
  );

  it(
    "adds a 3rd public key to the account",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Multisig(p, accountAddress("Account", env), [
        conf.accounts[0].privateKey,
        conf.accounts[1].privateKey,
      ]);
      await add_public_key(a, conf.accounts[2].publicKey, "Account", env);
      const c = await get_public_keys(a, "Account", env);
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(3);
      expect(`0x${c[2].toString(16)}`).toEqual(conf.accounts[2].publicKey);
    },
    timeout
  );

  it(
    "increments the counter with 2 of 3 signers",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Multisig(p, accountAddress("Account", env), [
        conf.accounts[1].privateKey,
        conf.accounts[2].privateKey,
      ]);
      const c1 = await increment(a, 1, env);
      expect(c1.isSuccess()).toEqual(true);
      const acc = account(0, env);
      const c2 = await get(acc, env);
      expect(c2).toBe(2n);
    },
    timeout
  );

  it(
    "increments the counter with 1 signer and fails",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Multisig(p, accountAddress("Account", env), [
        conf.accounts[0].privateKey,
      ]);
      try {
        const c1 = await increment(a, 1, env);
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBeDefined();
      }
      const acc = account(0, env);
      const c2 = await get(acc, env);
      expect(c2).toBe(2n);
    },
    timeout
  );

  it(
    "updates the account threshold back to 1",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Multisig(p, accountAddress("Account", env), [
        conf.accounts[0].privateKey,
        conf.accounts[1].privateKey,
      ]);
      const c1 = await set_threshold(a, 1n, "Account", env);
      expect(c1.isSuccess()).toEqual(true);
      const acc = account(0, env);
      const c = await get_threshold(acc, "Account", env);
      expect(c).toEqual(1n);
    },
    timeout
  );

  it(
    "increments the counter with one signer",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Multisig(p, accountAddress("Account", env), [
        conf.accounts[1].privateKey,
      ]);
      const c1 = await increment(a, 1, env);
      expect(c1.isSuccess()).toEqual(true);
      const acc = account(0, env);
      const c2 = await get(acc, env);
      expect(c2).toBe(3n);
    },
    timeout
  );

  it(
    "removes a public key from the account",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Multisig(p, accountAddress("Account", env), [
        conf.accounts[0].privateKey,
      ]);
      await remove_public_key(a, conf.accounts[1].publicKey, "Account", env);
      const c = await get_public_keys(a, "Account", env);
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(2);
      expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
    },
    timeout
  );

  it(
    "removes a public key from the account again",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Multisig(p, accountAddress("Account", env), [
        conf.accounts[0].privateKey,
      ]);
      await remove_public_key(a, conf.accounts[2].publicKey, "Account", env);
      const c = await get_public_keys(a, "Account", env);
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
    },
    timeout
  );

  it(
    "increments the counter with 1 signer and succeeds",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Multisig(p, accountAddress("Account", env), [
        conf.accounts[0].privateKey,
      ]);
      const c1 = await increment(a, 1, env);
      expect(c1.isSuccess()).toEqual(true);
      const acc = account(0, env);
      const c2 = await get(acc, env);
      expect(c2).toBe(4n);
    },
    timeout
  );
});
