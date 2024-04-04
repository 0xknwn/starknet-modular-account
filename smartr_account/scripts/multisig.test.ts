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

test("deploy counter class", async () => {
  const c = await deployClass("Counter");
  expect(c.classHash).toEqual(classHash("Counter"));
}, 20000);

test("check counter address", async () => {
  const c = await deployContract();
  expect(c.address).toEqual(counterAddress());
}, 30000);

test("deploy account class", async () => {
  const c = await deployClass("Account");
  expect(c.classHash).toEqual(classHash("Account"));
}, 20000);

test("deploy account", async () => {
  const conf = config();
  const c = await deployAccount("Account");
  expect(c).toEqual(accountAddress("Account"));
}, 120000);

test("account public keys", async () => {
  const conf = config();
  const a = account();
  const c = await get_public_keys(a);
  expect(Array.isArray(c)).toBe(true);
  expect(c.length).toEqual(1);
  expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
}, 120000);

test("reset counter with owner", async () => {
  const a = account();
  await reset(a);
}, 120000);

test("read counter", async () => {
  const a = account();
  const c = await get(a);
  expect(c).toBe(0n);
}, 120000);

test("increment counter", async () => {
  const conf = config();
  const p = provider();
  const a = new Multisig(p, accountAddress("Account"), [
    conf.accounts[0].privateKey,
  ]);
  const c = await increment(a);
  expect(c.isSuccess()).toEqual(true);
}, 120000);

test("read counter", async () => {
  const a = account();
  const c = await get(a);
  expect(c).toBe(1n);
}, 120000);

test("add/check a new public key", async () => {
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
}, 120000);

test("reset and increment counter", async () => {
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
}, 120000);

test("update threshold to 2", async () => {
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
}, 120000);

test("add/check a new public key", async () => {
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
}, 120000);

test("increment counter with 2 of 3 signers", async () => {
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
}, 120000);

test("increment counter with 1 signer", async () => {
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
}, 120000);

test("update threshold to 1", async () => {
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
}, 120000);

test("increment counter", async () => {
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
}, 120000);

test("remove a key from the account", async () => {
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
}, 120000);

test("remove a key from the account", async () => {
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
}, 120000);

test("increment counter", async () => {
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
}, 120000);
