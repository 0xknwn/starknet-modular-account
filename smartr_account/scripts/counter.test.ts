import {
  deployClass,
  deployContract,
  increment,
  get,
  reset,
  CounterClassHash,
  CounterContractAddress,
} from "./counter";

test("deploy counter class", async () => {
  const c = await deployClass();
  expect(c.classHash).toEqual(CounterClassHash);
}, 20000);

test("deploy counter contract", async () => {
  const c = await deployContract();
  expect(c.address).toEqual(CounterContractAddress);
}, 120000);

test("increment counter", async () => {
  const c = await increment();
  expect(c.execution_status).toEqual("SUCCEEDED");
}, 120000);

test("read counter", async () => {
  const c = await get();
  expect(c).toBeGreaterThan(0n);
}, 120000);

test("reset counter", async () => {
  const c = await reset();
  expect(c.execution_status).toEqual("SUCCEEDED");
}, 120000);

test("read counter", async () => {
  const c = await get();
  expect(c).toBe(0n);
}, 120000);

test("increment counter", async () => {
  const c = await increment();
  expect(c.execution_status).toEqual("SUCCEEDED");
}, 120000);

test("read counter", async () => {
  const c = await get();
  expect(c).toBeGreaterThan(0n);
}, 120000);

test("reset counter", async () => {
  try {
    await reset(1);
    expect(true).toBe(false);
  } catch (e) {
    expect(e).toBeDefined();
  }
}, 120000);

test("read counter", async () => {
  const c = await get();
  expect(c).toBeGreaterThan(0n);
}, 120000);
