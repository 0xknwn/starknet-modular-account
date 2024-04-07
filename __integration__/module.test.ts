import { deployClass } from "./class";
import { accountAddress, deployAccount, get_public_keys } from "./account";
import { config, classHash, account, provider } from "./utils";
import {
  deployCounterContract,
  counterAddress,
  increment,
  get,
  reset,
} from "./counter";
import { Multisig } from "./multisig";
import {
  add_module,
  is_module,
  remove_module,
  get_initialization,
} from "./module";
import { timeout } from "./constants";
import { SessionKey } from "./module";

describe("module management", () => {
  let env: string;
  beforeAll(() => {
    env = "devnet";
  });

  it(
    "deploys the Counter class",
    async () => {
      const c = await deployClass("Counter", env);
      expect(c.classHash).toEqual(classHash("Counter"));
    },
    timeout
  );

  it(
    "deploys the counter contract",
    async () => {
      const c = await deployCounterContract(env);
      expect(c.address).toEqual(counterAddress(env));
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
    "deploys the account",
    async () => {
      const c = await deployAccount("Account", env);
      expect(c).toEqual(accountAddress("Account", env));
    },
    timeout
  );

  it(
    "deploys the SimpleModule class",
    async () => {
      const c = await deployClass("SimpleModule", env);
      expect(c.classHash).toEqual(classHash("SimpleModule"));
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
    "checks the module 0x0 is not installed",
    async () => {
      const a = account(0, env);
      const c = await is_module(a, "0x0", env);
      expect(c).toBe(false);
    },
    timeout
  );

  it(
    "adds a module to the account",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Multisig(p, accountAddress("Account", env), [
        conf.accounts[0].privateKey,
      ]);
      const c = await add_module(a, classHash("SimpleModule"), env);
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "checks the module with the account",
    async () => {
      const acc = account(0, env);
      const value = await is_module(acc, classHash("SimpleModule"), env);
      expect(value).toBe(true);
    },
    timeout
  );

  it(
    "checks the module initialize has been called",
    async () => {
      const acc = account(0, env);
      const c = await get_initialization(acc, env);
      expect(`0x${c.toString(16)}`).toEqual("0x8");
    },
    timeout
  );

  it(
    "adds the module to the account again",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Multisig(p, accountAddress("Account", env), [
        conf.accounts[0].privateKey,
      ]);
      try {
        const c = await add_module(a, classHash("SimpleModule"), env);
        expect(c.isSuccess()).toEqual(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
      const acc = account(0, env);
      const value = await is_module(acc, classHash("SimpleModule"), env);
      expect(value).toBe(true);
    },
    timeout
  );

  it(
    "resets the counter",
    async () => {
      const acc = account(0, env);
      await reset(acc, env);
      const c2 = await get(acc, env);
      expect(c2).toBe(0n);
    },
    timeout
  );

  it(
    "calls increment with module",
    async () => {
      const p = provider(env);
      const module = new SessionKey(
        "0x0",
        accountAddress("Account", env),
        classHash("SimpleModule")
      );
      const a = new Multisig(p, accountAddress("Account", env), [], module);
      const c = await increment(a, 1, env);
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "reads the counter",
    async () => {
      const a = account(0, env);
      const c = await get(a, env);
      expect(c).toBe(1n);
    },
    timeout
  );

  it(
    "removes the module from account",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Multisig(
        p,
        accountAddress("Account", env),
        [conf.accounts[0].privateKey],
        undefined
      );
      const c = await remove_module(a, classHash("SimpleModule"), env);
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "checks the module with the account",
    async () => {
      const acc = account(0, env);
      const value = await is_module(acc, classHash("SimpleModule"), env);
      expect(value).toBe(false);
    },
    timeout
  );

  it(
    "calls increment with not installed module",
    async () => {
      const p = provider(env);
      const module = new SessionKey(
        "0x0",
        accountAddress("Account", env),
        classHash("SimpleModule")
      );
      const a = new Multisig(p, accountAddress("Account", env), [], module);
      try {
        await increment(a, 1, env);
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBeDefined();
      }
    },
    timeout
  );
});
