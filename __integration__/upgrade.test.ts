import { deployClass } from "./class";
import { accountAddress, deployAccount, upgrade } from "./account";
import { config, account, classHash, provider } from "./utils";
import { Account } from "starknet";
import { timeout } from "./constants";

describe("account upgrade and downgrade", () => {
  it(
    "deploys the SimpleAccount class",
    async () => {
      const c = await deployClass("SimpleAccount");
      expect(c.classHash).toEqual(classHash("SimpleAccount"));
    },
    timeout
  );

  it(
    "deploys the Account class",
    async () => {
      const c = await deployClass("Account");
      expect(c.classHash).toEqual(classHash("Account"));
    },
    timeout
  );

  it(
    "deploys the account contract with Account",
    async () => {
      const conf = config();
      const c = await deployAccount("Account");
      expect(c).toEqual(accountAddress("Account"));
    },
    timeout
  );

  it(
    "checks the account class hash",
    async () => {
      const c = config();
      const p = provider();
      const a2 = new Account(
        p,
        accountAddress("Account"),
        c.accounts[0].privateKey
      );
      const deployedClass = await a2.getClassHashAt(a2.address);
      expect(deployedClass).toEqual(classHash("Account"));
    },
    timeout
  );

  it(
    "upgrades the account with SimpleAccount",
    async () => {
      const c = config();
      const p = provider();
      const a2 = new Account(
        p,
        accountAddress("Account"),
        c.accounts[0].privateKey
      );
      const txReceipt = await upgrade(a2, classHash("SimpleAccount"));
      expect(txReceipt.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "checks the new account class hash",
    async () => {
      const c = config();
      const p = provider();
      const a2 = new Account(
        p,
        accountAddress("Account"),
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
      const c = config();
      const p = provider();
      const a2 = new Account(
        p,
        accountAddress("Account"),
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
      const c = config();
      const p = provider();
      const a2 = new Account(
        p,
        accountAddress("Account"),
        c.accounts[0].privateKey
      );
      const deployedClass = await a2.getClassHashAt(a2.address);
      expect(deployedClass).toEqual(classHash("Account"));
    },
    timeout
  );
});
