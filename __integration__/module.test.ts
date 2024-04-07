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
import { add_plugin, is_plugin, remove_plugin } from "./plugin";
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

  it("checks the counter address", async () => {
    expect(counterAddress(env)).toEqual(
      "0x177578170200d3ef6bf17a62f44dde7ae5b89cbe670e6a0c328f63819a1a20a"
    );
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
      const conf = config(env);
      const c = await deployAccount("Account", env);
      expect(c).toEqual(accountAddress("Account", env));
    },
    timeout
  );

  it(
    "checks the account public keys",
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
    "deploys the SimplePlugin class",
    async () => {
      const c = await deployClass("SimplePlugin", env);
      expect(c.classHash).toEqual(classHash("SimplePlugin"));
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
    },
    timeout
  );

  it(
    "checks the plugin with the account",
    async () => {
      const acc = account(0, env);
      const value = await is_plugin(acc, classHash("SimplePlugin"), env);
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
        classHash("SimplePlugin")
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
    "removes the plugin from account",
    async () => {
      const conf = config(env);
      const p = provider(env);
      const a = new Multisig(
        p,
        accountAddress("Account", env),
        [conf.accounts[0].privateKey],
        undefined
      );
      const c = await remove_plugin(a, classHash("SimplePlugin"), env);
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "checks the plugin with the account",
    async () => {
      const acc = account(0, env);
      const value = await is_plugin(acc, classHash("SimplePlugin"), env);
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
        classHash("SimplePlugin")
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
