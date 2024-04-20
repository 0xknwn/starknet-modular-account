import { deployClass, classHash } from "./class";
import { testAccount, config, type ContractConfig, provider } from "./utils";
import {
  deployCounterContract,
  counterAddress,
  reset,
  increment,
  increment_by_array,
  get,
} from "./counter";
import { timeout } from "./constants";
import { Account } from "starknet";

describe.skip("counter contract (helper)", () => {
  let env: string;
  let testAccounts: Account[];
  let counterContract: ContractConfig;
  let altURL: string;
  beforeAll(() => {
    env = "devnet";
    const conf = config(env);
    // altURL = "http://localhost:8080";
    if (!altURL) {
      altURL = conf.providerURL;
    }
    testAccounts = [testAccount(0, conf), testAccount(1, conf)];
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
    "increments the counter",
    async () => {
      const a = testAccounts[0];
      const c = await increment(a, counterContract.address, [1]);
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "reads the counter",
    async () => {
      const a = testAccounts[0];
      const c = await get(a, counterContract.address);
      expect(c).toBeGreaterThan(0n);
    },
    timeout
  );

  it(
    "increments the counter by 5 and 6",
    async () => {
      const a = testAccounts[0];
      const c = await increment(a, counterContract.address, [5, 6, 1]);
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "reads the counter",
    async () => {
      const a = testAccounts[0];
      const c = await get(a, counterContract.address);
      expect(c).toBeGreaterThan(11n);
    },
    timeout
  );

  it(
    "resets the counter",
    async () => {
      const a = testAccounts[0];
      const c = await reset(a, counterContract.address);
      expect(c.isSuccess()).toEqual(true);
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
      const a = testAccounts[0];
      const c = await increment(a, counterContract.address, 1);
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "increments the counter with an alt provider URL",
    async () => {
      const conf = config(env);
      const p = provider(altURL);
      const a = new Account(
        p,
        conf.accounts[0].address,
        conf.accounts[0].privateKey
      );
      const c = await increment_by_array(a, counterContract.address, [1, 2, 3]);
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "reads the counter",
    async () => {
      const a = testAccounts[0];
      const c = await get(a, counterContract.address);
      expect(c).toBeGreaterThan(0n);
    },
    timeout
  );

  it(
    "resets the counter and fails",
    async () => {
      const a = testAccounts[1];
      try {
        const c = await reset(a, counterContract.address);
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
      expect(c).toBeGreaterThan(0n);
    },
    timeout
  );
});
