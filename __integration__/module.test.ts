import { deployClass, classHash } from "./class";
import { accountAddress, deployAccount, get_public_keys } from "./account";
import { simpleValidatorClassHash } from "./validator";
import {
  config,
  testAccount,
  provider,
  type AccountConfig,
  type ContractConfig,
} from "./utils";
import {
  reset,
  increment,
  get,
  deployCounterContract,
  counterAddress,
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
import { Account } from "starknet";

describe("module management", () => {
  let env: string;
  let testAccounts: Account[];
  let targetAccounts: AccountConfig[];
  let counterContract: ContractConfig;
  beforeAll(() => {
    env = "devnet";
    const conf = config(env);
    testAccounts = [testAccount(0, conf), testAccount(1, conf)];
    targetAccounts = [
      {
        classHash: classHash("Account"),
        address: accountAddress("Account", conf.accounts[0].publicKey),
        publicKey: conf.accounts[0].publicKey,
        privateKey: conf.accounts[0].privateKey,
      },
    ];
  });

  it(
    "deploys the Counter class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "Counter");
      expect(c.classHash).toEqual(classHash("Counter"));
    },
    timeout
  );

  it(
    "deploys the counter contract",
    async () => {
      const a = testAccounts[0];
      const c = await deployCounterContract(a);
      expect(c.address).toEqual(counterAddress(a.address));
      counterContract = {
        classHash: classHash("Counter"),
        address: counterAddress(a.address),
      };
    },
    timeout
  );
  it(
    "deploys the SimpleValidator class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "SimpleValidator");
      expect(c.classHash).toEqual(
        `0x${simpleValidatorClassHash().toString(16)}`
      );
    },
    timeout
  );

  it(
    "deploys the Account class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "Account");
      expect(c.classHash).toEqual(classHash("Account"));
    },
    timeout
  );

  it(
    "deploys the account contract",
    async () => {
      const a = testAccounts[0];
      const publicKey = await testAccounts[0].signer.getPubKey();
      const c = await deployAccount(a, "Account", publicKey);
      expect(c).toEqual(accountAddress("Account", publicKey));
    },
    timeout
  );

  it(
    "checks the account public keys",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccounts[0].address, [
        conf.accounts[0].privateKey,
      ]);
      const c = await get_public_keys(a);
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      expect(`0x${c[0].toString(16)}`).toEqual(targetAccounts[0].publicKey);
    },
    timeout
  );

  it(
    "deploys the SimpleModule class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "SimpleModule");
      expect(c.classHash).toEqual(classHash("SimpleModule"));
    },
    timeout
  );

  it(
    "checks the module 0x0 is not installed",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccounts[0].address, [
        conf.accounts[0].privateKey,
      ]);
      const c = await is_module(a, "0x0");
      expect(c).toBe(false);
    },
    timeout
  );

  it(
    "adds a module to the account",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccounts[0].address, [
        conf.accounts[0].privateKey,
      ]);
      const c = await add_module(a, classHash("SimpleModule"));
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "checks the module with the account",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccounts[0].address, [
        conf.accounts[0].privateKey,
      ]);
      const value = await is_module(a, classHash("SimpleModule"));
      expect(value).toBe(true);
    },
    timeout
  );

  it(
    "checks the module initialize has been called",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccounts[0].address, [
        conf.accounts[0].privateKey,
      ]);
      const c = await get_initialization(a);
      expect(`0x${c.toString(16)}`).toEqual("0x8");
    },
    timeout
  );

  it(
    "adds the module to the account again",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccounts[0].address, [
        conf.accounts[0].privateKey,
      ]);
      try {
        const c = await add_module(a, classHash("SimpleModule"));
        expect(true).toEqual(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
    },
    timeout
  );

  it(
    "resets the counter with owner",
    async () => {
      const a = testAccounts[0];
      await reset(a, counterContract.address);
    },
    timeout
  );

  it(
    "calls increment with module",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const module = new SessionKey(
        "0x0",
        targetAccounts[0].address,
        classHash("SimpleModule")
      );
      const a = new Multisig(p, targetAccounts[0].address, [], module);
      const c = await increment(a, counterContract.address, 1);
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "reads the counter",
    async () => {
      const a = testAccounts[0];
      const c = await get(a, counterContract.address);
      expect(c).toBe(1n);
    },
    timeout
  );

  it(
    "removes the module from account",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(
        p,
        targetAccounts[0].address,
        [targetAccounts[0].privateKey],
        undefined
      );
      const c = await remove_module(a, classHash("SimpleModule"));
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "checks the module with the account",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(
        p,
        targetAccounts[0].address,
        [targetAccounts[0].privateKey],
        undefined
      );
      const value = await is_module(a, classHash("SimpleModule"));
      expect(value).toBe(false);
    },
    timeout
  );

  it(
    "calls increment with not installed module",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const module = new SessionKey(
        "0x0",
        targetAccounts[0].address,
        classHash("SimpleModule")
      );
      const a = new Multisig(p, targetAccounts[0].address, [], module);
      try {
        await increment(a, counterContract.address, 1);
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBeDefined();
      }
    },
    timeout
  );
});
