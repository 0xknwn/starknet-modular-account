import { deployClass } from "./class";
import { accountAddress, deployAccount, get_public_keys } from "./account";
import { is_plugin, add_plugin, remove_plugin } from "./plugin";
import { config, account, classHash, provider } from "./utils";
import { Account } from "starknet";
import { timeout } from "./constants";

describe("plugin management", () => {
  it(
    "deploys the Account class",
    async () => {
      const c = await deployClass("Account");
      expect(c.classHash).toEqual(classHash("Account"));
    },
    timeout
  );

  it(
    "deploys the account",
    async () => {
      const conf = config();
      const c = await deployAccount("Account");
      expect(c).toEqual(accountAddress("Account"));
    },
    timeout
  );

  it(
    "deploys the SimplePlugin class",
    async () => {
      const c = await deployClass("SimplePlugin");
      expect(c.classHash).toEqual(classHash("SimplePlugin"));
    },
    timeout
  );

  it(
    "checks the public keys",
    async () => {
      const conf = config();
      const a = account();
      const c = await get_public_keys(a);
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
    },
    timeout
  );

  it(
    "checks the account plugin is not installed",
    async () => {
      const conf = config();
      const a = account();
      const c = await is_plugin(a, "0x0");
      expect(c).toBe(false);
    },
    timeout
  );

  it(
    "adds a plugin to the account",
    async () => {
      const conf = config();
      const p = provider();
      const a = new Account(
        p,
        accountAddress("Account"),
        conf.accounts[0].privateKey
      );
      const c = await add_plugin(a, classHash("SimplePlugin"));
      expect(c.isSuccess()).toEqual(true);
      const acc = account();
      const value = await is_plugin(acc, classHash("SimplePlugin"));
      expect(value).toBe(true);
    },
    timeout
  );

  it(
    "adds the plugin to the account again",
    async () => {
      const conf = config();
      const p = provider();
      const a = new Account(
        p,
        accountAddress("Account"),
        conf.accounts[0].privateKey
      );
      try {
        const c = await add_plugin(a, classHash("SimplePlugin"));
        expect(c.isSuccess()).toEqual(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
      const acc = account();
      const value = await is_plugin(acc, classHash("SimplePlugin"));
      expect(value).toBe(true);
    },
    timeout
  );

  it(
    "removes the plugin from account",
    async () => {
      const conf = config();
      const p = provider();
      const a = new Account(
        p,
        accountAddress("Account"),
        conf.accounts[0].privateKey
      );
      const c = await remove_plugin(a, classHash("SimplePlugin"));
      expect(c.isSuccess()).toEqual(true);
      const acc = account();
      const value = await is_plugin(acc, classHash("SimplePlugin"));
      expect(value).toBe(false);
    },
    timeout
  );
});
