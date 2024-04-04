import { deployClass } from "./class";
import {
  accountAddress,
  deployAccount,
  get_threshold,
  get_public_keys,
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

test("account threshold", async () => {
  const a = account();
  const c = await get_threshold(a);
  expect(c).toEqual(1n);
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
