import { deployClass } from "./class";
import { accountAddress, deployAccount, upgrade } from "./account";
import { config, classHash, provider } from "./utils";
import { Account } from "starknet";
import { timeout } from "./constants";

describe("account upgrade and downgrade", () => {
  let env: string;
  beforeAll(() => {
    env = "devnet";
  });

  it(
    "deploys the SimpleAccount class",
    async () => {
      const c = await deployClass("SimpleAccount", env);
      expect(c.classHash).toEqual(classHash("SimpleAccount"));
    },
    timeout
  );

  it(
    "deploys the Account class",
    async () => {
      const c = await deployClass("Account", env);
      expect(c.classHash).toEqual(classHash("Account"));
    },
    timeout
  );

  it(
    "deploys the account contract with Account",
    async () => {
      const conf = config(env);
      const c = await deployAccount("Account", env);
      expect(c).toEqual(accountAddress("Account", env));
    },
    timeout
  );

  it(
    "checks the account class hash",
    async () => {
      const c = config(env);
      const p = provider(env);
      const a = new Account(
        p,
        accountAddress("Account", env),
        c.accounts[0].privateKey
      );
      const deployedClass = await a.getClassHashAt(a.address);
      expect(deployedClass).toEqual(classHash("Account"));
    },
    timeout
  );

  it(
    "upgrades the account with SimpleAccount",
    async () => {
      const c = config(env);
      const p = provider(env);
      const a = new Account(
        p,
        accountAddress("Account", env),
        c.accounts[0].privateKey
      );
      const txReceipt = await upgrade(a, classHash("SimpleAccount"));
      expect(txReceipt.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "checks the new account class hash",
    async () => {
      const c = config(env);
      const p = provider(env);
      const a2 = new Account(
        p,
        accountAddress("Account", env),
        c.accounts[0].privateKey
      );
      const deployedClass = await a2.getClassHashAt(a2.address);
      expect(deployedClass).toEqual(classHash("SimpleAccount"));
    },
    timeout
  );

  it(
    "downgrades the account back to Account",
    async () => {
      const c = config(env);
      const p = provider(env);
      const a2 = new Account(
        p,
        accountAddress("Account", env),
        c.accounts[0].privateKey
      );
      const txReceipt = await upgrade(a2, classHash("Account"));
      expect(txReceipt.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "checks the account class hash",
    async () => {
      const c = config(env);
      const p = provider(env);
      const a2 = new Account(
        p,
        accountAddress("Account", env),
        c.accounts[0].privateKey
      );
      const deployedClass = await a2.getClassHashAt(a2.address);
      expect(deployedClass).toEqual(classHash("Account"));
    },
    timeout
  );
});
