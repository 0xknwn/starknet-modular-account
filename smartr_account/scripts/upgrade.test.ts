import { deployClass } from "./class";
import { accountAddress, deployAccount, upgrade } from "./account";
import { config, account, classHash, provider } from "./utils";
import { Account } from "starknet";

test("deploy SimpleAccount class", async () => {
  const c = await deployClass("SimpleAccount");
  expect(c.classHash).toEqual(classHash("SimpleAccount"));
}, 20000);

test("deploy Account class", async () => {
  const c = await deployClass("Account");
  expect(c.classHash).toEqual(classHash("Account"));
}, 20000);

test("deploy account", async () => {
  const conf = config();
  const c = await deployAccount("Account");
  expect(c).toEqual(accountAddress("Account"));
}, 120000);

test("check account classHash", async () => {
  const c = config();
  const p = provider();
  const a2 = new Account(
    p,
    accountAddress("Account"),
    c.accounts[0].privateKey
  );
  const deployedClass = await a2.getClassHashAt(a2.address);
  expect(deployedClass).toEqual(classHash("Account"));
}, 120000);

test("upgrade account", async () => {
  const c = config();
  const p = provider();
  const a2 = new Account(
    p,
    accountAddress("Account"),
    c.accounts[0].privateKey
  );
  const txReceipt = await upgrade(a2, classHash("SimpleAccount"));
  expect(txReceipt.execution_status).toEqual("SUCCEEDED");
}, 120000);

test("check account classHash", async () => {
  const c = config();
  const p = provider();
  const a2 = new Account(
    p,
    accountAddress("Account"),
    c.accounts[0].privateKey
  );
  const deployedClass = await a2.getClassHashAt(a2.address);
  expect(deployedClass).toEqual(classHash("SimpleAccount"));
}, 120000);

// todo: downgrade should have failed because of the public key is not in
// the same variable name as the previous class!

test("downgrade account", async () => {
  const c = config();
  const p = provider();
  const a2 = new Account(
    p,
    accountAddress("Account"),
    c.accounts[0].privateKey
  );
  const txReceipt = await upgrade(a2, classHash("Account"));
  expect(txReceipt.execution_status).toEqual("SUCCEEDED");
}, 120000);

test("check account classHash", async () => {
  const c = config();
  const p = provider();
  const a2 = new Account(
    p,
    accountAddress("Account"),
    c.accounts[0].privateKey
  );
  const deployedClass = await a2.getClassHashAt(a2.address);
  expect(deployedClass).toEqual(classHash("Account"));
}, 120000);
