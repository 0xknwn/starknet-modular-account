import { deployClass } from "./class";
import { accountAddress, deployAccount, get_public_keys } from "./account";
import { is_plugin } from "./plugin";
import { config, account, classHash } from "./utils";

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

test("account plugin", async () => {
  const conf = config();
  const a = account();
  const c = await is_plugin(a, "0x0");
  expect(c).toBe(false);
}, 120000);
