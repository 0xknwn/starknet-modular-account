import { deployClass } from "./class";
import { accountAddress, deployAccount, get_public_keys } from "./account";
import {
  is_plugin,
  add_plugin,
  remove_plugin,
  get_initialization,
} from "./plugin";
import { config, account, classHash, provider } from "./utils";
import { Account } from "starknet";
import { timeout } from "./constants";
import { Multisig } from "./multisig";

describe("plugin management", () => {
  let env: string;
  beforeAll(() => {
    env = "devnet";
  });

  it(
    "deploys the Account class",
    async () => {
      const c = await deployClass("Account", env);
      expect(c.classHash).toEqual(classHash("Account"));
    },
    timeout
  );

  it(
    "deploys the account",
    async () => {
      const c = await deployAccount("Account", env);
      expect(c).toEqual(accountAddress("Account", env));
    },
    timeout
  );

  it(
    "deploys the SimplePlugin class",
    async () => {
      const c = await deployClass("SimplePlugin", env);
      expect(c.classHash).toEqual(classHash("SimplePlugin"));
    },
    timeout
  );

  it(
    "checks the public keys",
    async () => {
      const conf = config(env);
      const a = account(0, env);
      const c = await get_public_keys(a, "Account", env);
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
    },
    timeout
  );

  it(
    "checks the account plugin is not installed",
    async () => {
      const a = account(0, env);
      const c = await is_plugin(a, "0x0", env);
      expect(c).toBe(false);
    },
    timeout
  );

  it(
    "adds a plugin to the account",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Multisig(p, accountAddress("Account", env), [
        conf.accounts[0].privateKey,
      ]);
      const c = await add_plugin(a, classHash("SimplePlugin"), env);
      expect(c.isSuccess()).toEqual(true);
      const acc = account(0, env);
      const value = await is_plugin(acc, classHash("SimplePlugin"), env);
      expect(value).toBe(true);
    },
    timeout
  );

  it(
    "checks the plugin initialize has been called",
    async () => {
      const acc = account(0, env);
      const c = await get_initialization(acc, env);
      expect(`0x${c.toString(16)}`).toEqual("0x8");
    },
    timeout
  );

  it(
    "adds the plugin to the account again",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Account(
        p,
        accountAddress("Account", env),
        conf.accounts[0].privateKey
      );
      try {
        const c = await add_plugin(a, classHash("SimplePlugin"), env);
        expect(c.isSuccess()).toEqual(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
      const acc = account(0, env);
      const value = await is_plugin(acc, classHash("SimplePlugin"), env);
      expect(value).toBe(true);
    },
    timeout
  );

  it(
    "removes the plugin from account",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Account(
        p,
        accountAddress("Account", env),
        conf.accounts[0].privateKey
      );
      const c = await remove_plugin(a, classHash("SimplePlugin"), env);
      expect(c.isSuccess()).toEqual(true);
      const acc = account(0, env);
      const value = await is_plugin(acc, classHash("SimplePlugin"), env);
      expect(value).toBe(false);
    },
    timeout
  );
});
