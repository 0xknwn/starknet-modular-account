import { deployClass } from "./class";
import { accountAddress, deployAccount, get_public_keys } from "./account";
import { config, classHash, account, provider } from "./utils";
import {
  deployContract,
  counterAddress,
  increment,
  get,
  reset,
} from "./counter";
import { Multisig } from "./multisig";
import { add_plugin, is_plugin, remove_plugin } from "./plugin";
import { timeout } from "./constants";
import { SessionKey } from "./module";

describe("module signature", () => {
  it(
    "deploys the Counter class",
    async () => {
      const c = await deployClass("Counter");
      expect(c.classHash).toEqual(classHash("Counter"));
    },
    timeout
  );

  it(
    "deploys the counter contract",
    async () => {
      const c = await deployContract();
      expect(c.address).toEqual(counterAddress());
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
    "deploys the account",
    async () => {
      const conf = config();
      const c = await deployAccount("Account");
      expect(c).toEqual(accountAddress("Account"));
    },
    timeout
  );

  it(
    "checks the account public keys",
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
    "deploys the SimplePlugin class",
    async () => {
      const c = await deployClass("SimplePlugin");
      expect(c.classHash).toEqual(classHash("SimplePlugin"));
    },
    timeout
  );

  it(
    "adds a plugin to the account",
    async () => {
      const conf = config();
      const p = provider();
      const a = new Multisig(p, accountAddress("Account"), [
        conf.accounts[0].privateKey,
      ]);
      const c = await add_plugin(a, classHash("SimplePlugin"));
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "checks the plugin with the account",
    async () => {
      const acc = account();
      const value = await is_plugin(acc, classHash("SimplePlugin"));
      expect(value).toBe(true);
    },
    timeout
  );

  it(
    "resets the counter",
    async () => {
      const acc = account();
      await reset(acc);
      const c2 = await get(acc);
      expect(c2).toBe(0n);
    },
    timeout
  );

  it(
    "calls increment with module",
    async () => {
      const conf = config();
      const p = provider();
      const module = new SessionKey(
        "0x0",
        accountAddress("Account"),
        classHash("SimplePlugin")
      );
      const a = new Multisig(p, accountAddress("Account"), [], module);
      const c = await increment(a);
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "reads the counter",
    async () => {
      const a = account();
      const c = await get(a);
      expect(c).toBe(1n);
    },
    timeout
  );

  it(
    "removes the plugin from account",
    async () => {
      const conf = config();
      const p = provider();
      const a = new Multisig(
        p,
        accountAddress("Account"),
        [conf.accounts[0].privateKey],
        undefined
      );
      const c = await remove_plugin(a, classHash("SimplePlugin"));
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "checks the plugin with the account",
    async () => {
      const acc = account();
      const value = await is_plugin(acc, classHash("SimplePlugin"));
      expect(value).toBe(false);
    },
    timeout
  );

  it(
    "calls increment with not installed module",
    async () => {
      const conf = config();
      const p = provider();
      const module = new SessionKey(
        "0x0",
        accountAddress("Account"),
        classHash("SimplePlugin")
      );
      const a = new Multisig(p, accountAddress("Account"), [], module);
      try {
        const c = await increment(a);
        expect(c.isSuccess()).toEqual(true);
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBeDefined();
      }
    },
    timeout
  );
});
