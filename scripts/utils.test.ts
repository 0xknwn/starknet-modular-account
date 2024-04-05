import {
  config,
  account,
  provider,
  ethBalance,
  strkBalance,
  ethTransfer,
} from "./utils";

test("config file", async () => {
  const c = config();
  expect(c.providerURL).toBe("http://127.0.0.1:5050/rpc");
  expect(c.chainID).toBe("0x534e5f474f45524c49");
  expect(c.accounts[0]).not.toBe(undefined);
  expect(c.accounts[0].address).not.toBe(undefined);
});

test("provider", async () => {
  const p = provider();
  expect(await p.getSpecVersion()).toBe("0.7.0");
});

test("ethBalance", async () => {
  const c = config();
  const amount = await ethBalance(c.accounts[0].address);
  expect(amount).toBeGreaterThanOrEqual(100000000000000000000n);
});

test("strkBalance", async () => {
  const c = config();
  const amount = await strkBalance(c.accounts[0].address);
  expect(amount).toBeGreaterThanOrEqual(100000000000000000000n);
});

test("ethTransfer", async () => {
  const c = config();
  const a = account();
  const destAddress = c.accounts[1].address;
  const initialAmount = (await ethBalance(c.accounts[0].address)) as bigint;
  const receipt = await ethTransfer(a, destAddress, 10n ** 16n);
  expect(receipt.isSuccess()).toBe(true);
  const finalAmount = (await ethBalance(c.accounts[0].address)) as bigint;
  expect(initialAmount - finalAmount).toBeGreaterThanOrEqual(
    10000000000000000n
  );
}, 20000);
