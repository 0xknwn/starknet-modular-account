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
  deployContract,
  counterAddress,
} from "./counter";
import { Multisig } from "./multisig";
import { timeout } from "./constants";

describe("multiple signatures", () => {
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
      const c = await deployContract();
      expect(c.address).toEqual(counterAddress());
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
    "deploys the account",
    async () => {
      const conf = config();
      const c = await deployAccount("Account");
      expect(c).toEqual(accountAddress("Account"));
    },
    timeout
  );

  it(
    "checks the account public keys",
    async () => {
      const conf = config();
      const a = account();
      const c = await get_public_keys(a);
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
    },
    timeout
  );

  it(
    "resets the counter with its owner",
    async () => {
      const a = account();
      await reset(a);
    },
    timeout
  );

  it(
    "reads the counter",
    async () => {
      const a = account();
      const c = await get(a);
      expect(c).toBe(0n);
    },
    timeout
  );

  it(
    "increments the counter",
    async () => {
      const conf = config();
      const p = provider();
      const a = new Multisig(p, accountAddress("Account"), [
        conf.accounts[0].privateKey,
      ]);
      const c = await increment(a);
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "reads the counter",
    async () => {
      const a = account();
      const c = await get(a);
      expect(c).toBe(1n);
    },
    timeout
  );

  it(
    "adds/checks a new public key to the account",
    async () => {
      const conf = config();
      const p = provider();
      const a = new Multisig(p, accountAddress("Account"), [
        conf.accounts[0].privateKey,
      ]);
      await add_public_key(a, conf.accounts[1].publicKey);
      const c = await get_public_keys(a);
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(2);
      expect(`0x${c[1].toString(16)}`).toEqual(conf.accounts[1].publicKey);
    },
    timeout
  );

  it(
    "resets and increments the counter",
    async () => {
      const acc = account();
      await reset(acc);
      const conf = config();
      const p = provider();
      const a = new Multisig(p, accountAddress("Account"), [
        conf.accounts[1].privateKey,
      ]);
      const c1 = await increment(a);
      expect(c1.isSuccess()).toEqual(true);
      const c2 = await get(a);
      expect(c2).toBe(1n);
    },
    timeout
  );

  it(
    "updates the account threshold to 2",
    async () => {
      const conf = config();
      const p = provider();
      const a = new Multisig(p, accountAddress("Account"), [
        conf.accounts[1].privateKey,
      ]);
      const c1 = await set_threshold(a, 2n);
      expect(c1.isSuccess()).toEqual(true);
      const acc = account();
      const c = await get_threshold(acc);
      expect(c).toEqual(2n);
    },
    timeout
  );

  it(
    "adds a 3rd public key to the account",
    async () => {
      const conf = config();
      const p = provider();
      const a = new Multisig(p, accountAddress("Account"), [
        conf.accounts[0].privateKey,
        conf.accounts[1].privateKey,
      ]);
      await add_public_key(a, conf.accounts[2].publicKey);
      const c = await get_public_keys(a);
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(3);
      expect(`0x${c[2].toString(16)}`).toEqual(conf.accounts[2].publicKey);
    },
    timeout
  );

  it(
    "increments the counter with 2 of 3 signers",
    async () => {
      const conf = config();
      const p = provider();
      const a = new Multisig(p, accountAddress("Account"), [
        conf.accounts[1].privateKey,
        conf.accounts[2].privateKey,
      ]);
      const c1 = await increment(a);
      expect(c1.isSuccess()).toEqual(true);
      const acc = account();
      const c2 = await get(acc);
      expect(c2).toBe(2n);
    },
    timeout
  );

  it(
    "increments the counter with 1 signer and fails",
    async () => {
      const conf = config();
      const p = provider();
      const a = new Multisig(p, accountAddress("Account"), [
        conf.accounts[0].privateKey,
      ]);
      try {
        const c1 = await increment(a);
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBeDefined();
      }
      const acc = account();
      const c2 = await get(acc);
      expect(c2).toBe(2n);
    },
    timeout
  );

  it(
    "updates the account threshold back to 1",
    async () => {
      const conf = config();
      const p = provider();
      const a = new Multisig(p, accountAddress("Account"), [
        conf.accounts[0].privateKey,
        conf.accounts[1].privateKey,
      ]);
      const c1 = await set_threshold(a, 1n);
      expect(c1.isSuccess()).toEqual(true);
      const acc = account();
      const c = await get_threshold(acc);
      expect(c).toEqual(1n);
    },
    timeout
  );

  it(
    "increments the counter with one signer",
    async () => {
      const conf = config();
      const p = provider();
      const a = new Multisig(p, accountAddress("Account"), [
        conf.accounts[1].privateKey,
      ]);
      const c1 = await increment(a);
      expect(c1.isSuccess()).toEqual(true);
      const acc = account();
      const c2 = await get(acc);
      expect(c2).toBe(3n);
    },
    timeout
  );

  it(
    "removes a public key from the account",
    async () => {
      const conf = config();
      const p = provider();
      const a = new Multisig(p, accountAddress("Account"), [
        conf.accounts[0].privateKey,
      ]);
      await remove_public_key(a, conf.accounts[1].publicKey);
      const c = await get_public_keys(a);
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(2);
      expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
    },
    timeout
  );

  it(
    "removes a public key from the account again",
    async () => {
      const conf = config();
      const p = provider();
      const a = new Multisig(p, accountAddress("Account"), [
        conf.accounts[0].privateKey,
      ]);
      await remove_public_key(a, conf.accounts[2].publicKey);
      const c = await get_public_keys(a);
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
    },
    timeout
  );

  it(
    "increments the counter with 1 signer and succeeds",
    async () => {
      const conf = config();
      const p = provider();
      const a = new Multisig(p, accountAddress("Account"), [
        conf.accounts[0].privateKey,
      ]);
      const c1 = await increment(a);
      expect(c1.isSuccess()).toEqual(true);
      const acc = account();
      const c2 = await get(acc);
      expect(c2).toBe(4n);
    },
    timeout
  );
});
