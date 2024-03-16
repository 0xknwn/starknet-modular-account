import { deployClass, deployContract, increment, get, reset } from "./counter";

test("deploy counter class", async () => {
  const c = await deployClass();
  expect(c.classHash).toEqual(
    "0x6bb84ab149988a8aaec07001d5b81acf2a1ad8b8d001ef76d240a929949f4f9"
  );
}, 20000);

test("deploy counter contract", async () => {
  const c = await deployContract();
  expect(c.address).toEqual(
    "0x05399bea17614cfbaf83c9bc194335e1f24af7e4ba0588bebc3ad237ab5ad7d0"
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
