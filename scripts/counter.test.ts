import { deployClass } from "./class";
import { account, classHash } from "./utils";
import {
  deployContract,
  counterAddress,
  reset,
  increment,
  get,
} from "./counter";

test("deploy counter class", async () => {
  const c = await deployClass("Counter");
  expect(c.classHash).toEqual(classHash("Counter"));
}, 20000);

test("check counter address", async () => {
  const c = await deployContract();
  expect(c.address).toEqual(counterAddress());
}, 30000);

test("increment counter", async () => {
  const a = account();
  const c = await increment(a);
  expect(c.isSuccess()).toEqual(true);
}, 120000);

test("read counter", async () => {
  const a = account();
  const c = await get(a);
  expect(c).toBeGreaterThan(0n);
}, 120000);

test("reset counter", async () => {
  const a = account();
  const c = await reset(a);
  expect(c.isSuccess()).toEqual(true);
}, 120000);

test("read counter", async () => {
  const a = account();
  const c = await get(a);
  expect(c).toBe(0n);
}, 120000);

test("increment counter", async () => {
  const a = account();
  const c = await increment(a);
  expect(c.isSuccess()).toEqual(true);
}, 120000);

test("read counter", async () => {
  const a = account();
  const c = await get(a);
  expect(c).toBeGreaterThan(0n);
}, 120000);

test("reset counter", async () => {
  const a = account(1);
  try {
    await reset(a);
    expect(true).toBe(false);
  } catch (e) {
    expect(e).toBeDefined();
  }
}, 120000);

test("read counter", async () => {
  const a = account();
  const c = await get(a);
  expect(c).toBeGreaterThan(0n);
}, 120000);
