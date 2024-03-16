import { deployClass, deployContract, increment, get, reset } from "./counter";

test("deploy counter class", async () => {
  const c = await deployClass();
  expect(c.classHash).toEqual(
    "0xce25b8d2421fc99d0db1df808ae9e072a3e09774418d090c1dc31970458378"
  );
}, 20000);

test("deploy counter contract", async () => {
  const c = await deployContract();
  expect(c.address).toEqual(
    "0x4dfe918fec4be71295ab9d004d2289703d4393a65c2c07f6a9c1609032f59a4"
  );
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
