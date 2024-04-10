import { deployClass, classHash } from "./class";
import {
  accountAddress,
  deployAccount,
  get_threshold,
  get_public_keys,
} from "./account";
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
import { Account } from "starknet";
import { timeout } from "./constants";
import { coreValidatorClassHash } from "./core_validator";

describe("account management", () => {
  let env: string;
  let testAccounts: Account[];
  let targetAccounts: Account[];
  let targetAccountConfigs: AccountConfig[];
  let counterContract: ContractConfig;
  beforeAll(() => {
    env = "devnet";
    const conf = config(env);
    testAccounts = [testAccount(0, conf), testAccount(1, conf)];
    targetAccountConfigs = [
      {
        classHash: classHash("SmartrAccount"),
        address: accountAddress("SmartrAccount", conf.accounts[0].publicKey),
        publicKey: conf.accounts[0].publicKey,
        privateKey: conf.accounts[0].privateKey,
      },
    ];
    targetAccounts = [
      new Account(
        provider(conf.providerURL),
        targetAccountConfigs[0].address,
        targetAccountConfigs[0].privateKey
      ),
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
    "deploys the CoreValidator class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "CoreValidator");
      expect(c.classHash).toEqual(`0x${coreValidatorClassHash().toString(16)}`);
    },
    timeout
  );

  it(
    "deploys the Account class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "SmartrAccount");
      expect(c.classHash).toEqual(classHash("SmartrAccount"));
    },
    timeout
  );

  it(
    "deploys the account contract",
    async () => {
      const a = testAccounts[0];
      const publicKey = targetAccountConfigs[0].publicKey;
      const c = await deployAccount(a, "SmartrAccount", publicKey);
      expect(c).toEqual(accountAddress("SmartrAccount", publicKey));
    },
    timeout
  );

  it(
    "checks the account public keys",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = targetAccounts[0];
      const c = await get_public_keys(a);
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      expect(`0x${c[0].toString(16)}`).toEqual(
        targetAccountConfigs[0].publicKey
      );
    },
    timeout
  );

  it(
    "checks the account threshold",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = targetAccounts[0];
      const c = await get_threshold(a);
      expect(c).toEqual(1n);
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
    "reads the counter",
    async () => {
      const a = testAccounts[0];
      const c = await get(a, counterContract.address);
      expect(c).toBe(0n);
    },
    timeout
  );

  it(
    "increments the counter",
    async () => {
      const a = targetAccounts[0];
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
    "fails to reset the counter",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = targetAccounts[0];
      try {
        await reset(a, counterContract.address);
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
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
});
