import { deployClass } from "./class";
import { account, classHash } from "./utils";
import {
  deployCounterContract,
  counterAddress,
  reset,
  increment,
  get,
} from "./counter";
import { timeout } from "./constants";

describe("counter contract (helper)", () => {
  let env: string;
  beforeAll(() => {
    env = "devnet";
  });

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
      const c = await deployCounterContract();
      expect(c.address).toEqual(counterAddress(env));
    },
    timeout
  );

  it(
    "increments the counter",
    async () => {
      const a = account(0, env);
      const c = await increment(a);
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "reads the counter",
    async () => {
      const a = account(0, env);
      const c = await get(a);
      expect(c).toBeGreaterThan(0n);
    },
    timeout
  );

  it(
    "increments the counter by 5 and 6",
    async () => {
      const a = account(0, env);
      const c = await increment(a, [5, 6, 1]);
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "reads the counter",
    async () => {
      const a = account(0, env);
      const c = await get(a);
      expect(c).toBeGreaterThan(11n);
    },
    timeout
  );

  it(
    "resets the counter",
    async () => {
      const a = account(0, env);
      const c = await reset(a);
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "reads the counter",
    async () => {
      const a = account(0, env);
      const c = await get(a);
      expect(c).toBe(0n);
    },
    timeout
  );

  it(
    "increments the counter",
    async () => {
      const a = account(0, env);
      const c = await increment(a);
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "reads the counter",
    async () => {
      const a = account(0, env);
      const c = await get(a);
      expect(c).toBeGreaterThan(0n);
    },
    timeout
  );

  it(
    "resets the counter and fails",
    async () => {
      const a = account(1);
      try {
        await reset(a);
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
      const a = account(0, env);
      const c = await get(a);
      expect(c).toBeGreaterThan(0n);
    },
    timeout
  );
});
