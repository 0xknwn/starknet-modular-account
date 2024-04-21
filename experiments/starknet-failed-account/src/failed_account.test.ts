import {
  declareClass,
  classHash,
  deployCounter,
  testAccounts,
  default_timeout,
  Counter,
  counterAddress,
  config,
} from "starknet-test-helpers";

describe("sessionkey management", () => {
  let env: string;
  let counterContract: Counter;

  beforeAll(() => {
    env = "devnet";
  });

  it(
    "declare the Counter class",
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[0];
      const c = await declareClass(account, "Counter");
      expect(c.classHash).toEqual(classHash("Counter"));
    },
    default_timeout
  );

  // it(
  //   "deploys the counter contract",
  //   async () => {
  //     const a = testAccounts[0];
  //     const c = await deployCounterContract(a);
  //     expect(c.address).toEqual(counterAddress(a.address));
  //     counterContract = {
  //       classHash: classHash("Counter"),
  //       address: counterAddress(a.address),
  //     };
  //   },
  //   timeout
  // );

  // it(
  //   "deploys the FailedAccount class",
  //   async () => {
  //     const a = testAccounts[0];
  //     const c = await deployClass(a, "FailedAccount");
  //     expect(c.classHash).toEqual(classHash("FailedAccount"));
  //   },
  //   timeout
  // );

  // it(
  //   "deploys the account contract",
  //   async () => {
  //     const a = testAccounts[0];
  //     const publicKey = targetAccountConfigs[0].publicKey;
  //     const c = await deployAccount(a, "FailedAccount", publicKey);
  //     expect(c).toEqual(accountAddress("FailedAccount", publicKey));
  //   },
  //   timeout
  // );

  // it(
  //   "resets the counter with owner",
  //   async () => {
  //     const a = testAccounts[0];
  //     await reset(a, counterContract.address);
  //   },
  //   timeout
  // );

  // it(
  //   "reads the counter",
  //   async () => {
  //     const a = testAccounts[0];
  //     const c = await get(a, counterContract.address);
  //     expect(c).toBe(0n);
  //   },
  //   timeout
  // );

  // it(
  //   "increments the counter and succeed",
  //   async () => {
  //     const a = targetAccounts[0];
  //     const c = await increment(a, counterContract.address, 1);
  //     expect(c.isSuccess()).toBe(true);
  //   },
  //   timeout
  // );

  // it(
  //   "increments the counter and fail",
  //   async () => {
  //     const a = new Account(
  //       provider(altURL),
  //       targetAccountConfigs[0].address,
  //       targetAccountConfigs[0].privateKey
  //     );
  //     try {
  //       await increment(a, counterContract.address, 1);
  //       expect(true).toBe(false);
  //     } catch (e) {
  //       expect(e).toBeDefined();
  //     }
  //   },
  //   timeout
  // );

  // it(
  //   "reads the counter",
  //   async () => {
  //     const a = testAccounts[0];
  //     const c = await get(a, counterContract.address);
  //     expect(c).toBe(1n);
  //   },
  //   timeout
  // );
});
