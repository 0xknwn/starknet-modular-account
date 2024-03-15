import { config, provider, ethBalance, strkBalance } from "./utils";

test("config file", async () => {
  const c = config();
  expect(c.providerURL).toBe("http://127.0.0.1:5050/rpc");
  expect(c.chainID).toBe("0x534e5f474f45524c49");
  expect(c.account).not.toBe(undefined);
  expect(c.account.address).not.toBe(undefined);
});

test("provider", async () => {
  const p = provider();
  expect(await p.getSpecVersion()).toBe("0.7.0");
});

test("ethBalance", async () => {
  const c = config();
  const amount = await ethBalance(c.account.address);
  expect(amount).toBe(1000000000000000000000n);
});

test("strkBalance", async () => {
  const c = config();
  const amount = await strkBalance(c.account.address);
  expect(amount).toBe(1000000000000000000000n);
});
