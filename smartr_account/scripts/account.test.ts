import {
  deployClass,
  computeAccountAddress,
  deployAccount,
  AccountClassHash,
} from "./account";
import { config, ethBalance, ethTransfer } from "./utils";
import { increment, get, reset } from "./counter";

test("deploy account class", async () => {
  const c = await deployClass();
  expect(c.classHash).toEqual(AccountClassHash);
}, 20000);

test("compute account address", async () => {
  const conf = config();
  const c = computeAccountAddress();
  expect(c).toEqual(conf.accounts[2].address);
});

test("transfer eth to new account", async () => {
  const c = config();
  const receipt = await ethTransfer(0, 2, 10n ** 16n);
  expect(receipt.execution_status).toBe("SUCCEEDED");
  const finalAmount = (await ethBalance(c.accounts[2].address)) as bigint;
  expect(finalAmount).toBeGreaterThanOrEqual(10n ** 16n);
}, 20000);

test("deploy account contract", async () => {
  const conf = config();
  const c = await deployAccount();
  expect(c.contract_address).toEqual(conf.accounts[2].address);
}, 120000);

test("reset counter", async () => {
  const c = await reset(0);
  expect(c.execution_status).toBe("SUCCEEDED");
}, 120000);

test("increment counter", async () => {
  const c = await increment(2);
  expect(c.execution_status).toEqual("SUCCEEDED");
}, 120000);

test("read counter", async () => {
  const c = await get(2);
  expect(c).toBeGreaterThan(0n);
}, 120000);
