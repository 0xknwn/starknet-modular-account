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
// import { accountAddress, deployAccount } from "./smartr_account";
// import {
//   testAccount,
//   provider,
//   type AccountConfig,
//   type ContractConfig,
// } from "./utils";
import { Account, Contract } from "starknet";

describe("account management", () => {
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

  it(
    "deploys the Counter contract",
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[0];
      const c = await deployCounter(account, account.address);
      expect(c.address).toEqual(
        await counterAddress(account.address, account.address)
      );
      counterContract = new Counter(c.address, testAccounts(conf)[0]);
    },
    default_timeout
  );

  it(
    "deploys the coreValidator class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareClass(a, "CoreValidator");
      expect(c.classHash).toEqual(classHash("CoreValidator"));
    },
    default_timeout
  );

  // it(
  //   "deploys the Account class",
  //   async () => {
  //     const a = testAccounts[0];
  //     const c = await deployClass(a, "SmartrAccount");
  //     expect(c.classHash).toEqual(classHash("SmartrAccount"));
  //   },
  //   timeout
  // );

  // it(
  //   "deploys the account contract",
  //   async () => {
  //     const a = testAccounts[0];
  //     const publicKey = targetAccountConfigs[0].publicKey;
  //     const c = await deployAccount(a, "SmartrAccount", publicKey);
  //     expect(c).toEqual(accountAddress("SmartrAccount", publicKey));
  //   },
  //   timeout
  // );

  // it(
  //   "checks the account public keys",
  //   async () => {
  //     const conf = config(env);
  //     const p = provider(conf.providerURL);
  //     const a = targetAccounts[0];
  //     const c = await get_public_keys(a);
  //     expect(Array.isArray(c)).toBe(true);
  //     expect(c.length).toEqual(1);
  //     expect(`0x${c[0].toString(16)}`).toEqual(
  //       targetAccountConfigs[0].publicKey
  //     );
  //   },
  //   timeout
  // );

  // it(
  //   "checks the account threshold",
  //   async () => {
  //     const conf = config(env);
  //     const p = provider(conf.providerURL);
  //     const a = targetAccounts[0];
  //     const c = await get_threshold(a);
  //     expect(c).toEqual(1n);
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
  //   "increments the counter",
  //   async () => {
  //     const a = targetAccounts[0];
  //     const c = await increment(a, counterContract.address, 1);
  //     expect(c.isSuccess()).toEqual(true);
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

  // it(
  //   "fails to reset the counter",
  //   async () => {
  //     const conf = config(env);
  //     const p = provider(conf.providerURL);
  //     const a = targetAccounts[0];
  //     try {
  //       await reset(a, counterContract.address);
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
