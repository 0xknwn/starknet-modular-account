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
import {
  SmartrAccount,
  deploySmartrAccount,
  smartrAccountAddress,
} from "./smartr_account";
import { RpcProvider } from "starknet";

describe("multiple signature", () => {
  let env: string;
  let counterContract: Counter;
  let smartrAccount: SmartrAccount;

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

  it(
    "deploys the SmartrAccount class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareClass(a, "SmartrAccount");
      expect(c.classHash).toEqual(classHash("SmartrAccount"));
    },
    default_timeout
  );

  it(
    "deploys a SmartrAccount account",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const publicKey = conf.accounts[0].publicKey;
      const privateKey = conf.accounts[0].privateKey;
      const coreValidatorAddress = classHash("CoreValidator");
      const accountAddress = await deploySmartrAccount(
        a,
        publicKey,
        coreValidatorAddress
      );
      expect(accountAddress).toEqual(
        smartrAccountAddress(publicKey, coreValidatorAddress)
      );
      smartrAccount = new SmartrAccount(p, accountAddress, [privateKey]);
    },
    default_timeout
  );

  it(
    "checks the SmartAccount public keys",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await smartrAccount.get_public_keys();
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
    },
    default_timeout
  );

  it(
    "checks the SmartAccount threshhold",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await smartrAccount.get_threshold();
      expect(c).toEqual(1n);
    },
    default_timeout
  );

  it(
    "resets the counter",
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[0];
      if (!counterContract) {
        throw new Error("Counter not deployed");
      }
      const { transaction_hash } = await counterContract.reset();
      const receipt = await account.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "increments the counter from SmartrAccount and succeed",
    async () => {
      if (!counterContract) {
        throw new Error("Counter not deployed");
      }
      if (!smartrAccount) {
        throw new Error("SmartrAccount not installed");
      }
      const counterWithSmartrAccount = new Counter(
        counterContract.address,
        smartrAccount
      );
      const { transaction_hash } = await counterWithSmartrAccount.increment();
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "reads the counter",
    async () => {
      if (!counterContract) {
        throw new Error("Counter not deployed");
      }
      const c = await counterContract.get();
      expect(c).toBeGreaterThan(0n);
    },
    default_timeout
  );

  it(
    "resets the counter from SmartrAccount and fails",
    async () => {
      if (!counterContract) {
        throw new Error("Counter not deployed");
      }
      if (!smartrAccount) {
        throw new Error("SmartrAccount not installed");
      }
      const counterWithSmartrAccount = new Counter(
        counterContract.address,
        smartrAccount
      );
      try {
        await counterWithSmartrAccount.reset();
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
    },
    default_timeout
  );
});

//   it(
//     "checks the account threshold",
//     async () => {
//       const conf = config(env);
//       const p = provider(conf.providerURL);
//       const a = new Multisig(p, targetAccounts[0].address, [
//         targetAccounts[0].privateKey,
//       ]);
//       const c = await get_threshold(a);
//       expect(c).toEqual(1n);
//     },
//     timeout
//   );

//   it(
//     "resets the counter with owner",
//     async () => {
//       const a = testAccounts[0];
//       await reset(a, counterContract.address);
//     },
//     timeout
//   );

//   it(
//     "reads the counter",
//     async () => {
//       const a = testAccounts[0];
//       const c = await get(a, counterContract.address);
//       expect(c).toBe(0n);
//     },
//     timeout
//   );

//   it(
//     "increments the counter",
//     async () => {
//       const conf = config(env);
//       const p = provider(conf.providerURL);
//       const a = new Multisig(p, targetAccounts[0].address, [
//         targetAccounts[0].privateKey,
//       ]);
//       const c = await increment(a, counterContract.address, 1);
//       expect(c.isSuccess()).toEqual(true);
//     },
//     timeout
//   );

//   it(
//     "reads the counter",
//     async () => {
//       const a = testAccounts[0];
//       const c = await get(a, counterContract.address);
//       expect(c).toBe(1n);
//     },
//     timeout
//   );

//   it(
//     "adds a 2nd public key to the account",
//     async () => {
//       const conf = config(env);
//       const p = provider(conf.providerURL);
//       const a = new Multisig(p, targetAccounts[0].address, [
//         targetAccounts[0].privateKey,
//       ]);
//       await add_public_key(a, conf.accounts[1].publicKey);
//     },
//     timeout
//   );

//   it(
//     "checks the new public key with the account",
//     async () => {
//       const conf = config(env);
//       const p = provider(conf.providerURL);
//       const a = new Multisig(p, targetAccounts[0].address, [
//         targetAccounts[0].privateKey,
//       ]);
//       const c = await get_public_keys(a);
//       expect(Array.isArray(c)).toBe(true);
//       expect(c.length).toEqual(2);
//       expect(`0x${c[1].toString(16)}`).toEqual(conf.accounts[1].publicKey);
//     },
//     timeout
//   );

//   it(
//     "resets the counter with owner",
//     async () => {
//       const a = testAccounts[0];
//       await reset(a, counterContract.address);
//     },
//     timeout
//   );

//   it(
//     "increments the counter with newly added private key",
//     async () => {
//       const conf = config(env);
//       const p = provider(conf.providerURL);
//       const a = new Multisig(p, targetAccounts[0].address, [
//         conf.accounts[1].privateKey,
//       ]);
//       const c = await increment(a, counterContract.address, 1);
//       expect(c.isSuccess()).toEqual(true);
//     },
//     timeout
//   );

//   it(
//     "updates the account threshold to 2",
//     async () => {
//       const conf = config(env);
//       const p = provider(conf.providerURL);
//       const a = new Multisig(p, targetAccounts[0].address, [
//         targetAccounts[0].privateKey,
//       ]);
//       const c = await set_threshold(a, 2n);
//       expect(c.isSuccess()).toEqual(true);
//     },
//     timeout
//   );

//   it(
//     "adds a 3rd public key to the account",
//     async () => {
//       const conf = config(env);
//       const p = provider(conf.providerURL);
//       const a = new Multisig(p, targetAccounts[0].address, [
//         targetAccounts[0].privateKey,
//         conf.accounts[1].privateKey,
//       ]);
//       await add_public_key(a, conf.accounts[2].publicKey);
//     },
//     timeout
//   );

//   it(
//     "checks the new public key with the account",
//     async () => {
//       const conf = config(env);
//       const p = provider(conf.providerURL);
//       const a = new Multisig(p, targetAccounts[0].address, [
//         targetAccounts[0].privateKey,
//       ]);
//       const c = await get_public_keys(a);
//       expect(Array.isArray(c)).toBe(true);
//       expect(c.length).toEqual(3);
//       expect(`0x${c[2].toString(16)}`).toEqual(conf.accounts[2].publicKey);
//     },
//     timeout
//   );

//   it(
//     "increments the counter with 2 of 3 signers",
//     async () => {
//       const conf = config(env);
//       const p = provider(conf.providerURL);
//       const a = new Multisig(p, targetAccounts[0].address, [
//         conf.accounts[1].privateKey,
//         conf.accounts[2].privateKey,
//       ]);
//       const c1 = await increment(a, counterContract.address, 1);
//       expect(c1.isSuccess()).toEqual(true);
//       const c2 = await get(testAccounts[0], counterContract.address);
//       expect(c2).toBe(2n);
//     },
//     timeout
//   );

//   it(
//     "increments the counter with 1 signer and fails",
//     async () => {
//       const conf = config(env);
//       const p = provider(conf.providerURL);
//       const a = new Multisig(p, targetAccounts[0].address, [
//         targetAccounts[0].privateKey,
//       ]);
//       try {
//         const c1 = await increment(a, counterContract.address, 1);
//         expect(false).toBe(true);
//       } catch (e) {
//         expect(e).toBeDefined();
//       }
//       const c2 = await get(testAccounts[0], counterContract.address);
//       expect(c2).toBe(2n);
//     },
//     timeout
//   );

//   it(
//     "updates the account threshold back to 1",
//     async () => {
//       const conf = config(env);
//       const p = provider(conf.providerURL);
//       const a = new Multisig(p, targetAccounts[0].address, [
//         targetAccounts[0].privateKey,
//         conf.accounts[1].privateKey,
//       ]);
//       const c = await set_threshold(a, 1n);
//       expect(c.isSuccess()).toEqual(true);
//     },
//     timeout
//   );

//   it(
//     "checks the account threshold is 1",
//     async () => {
//       const conf = config(env);
//       const p = provider(conf.providerURL);
//       const a = new Multisig(p, targetAccounts[0].address, [
//         targetAccounts[0].privateKey,
//         conf.accounts[1].privateKey,
//       ]);
//       const c = await get_threshold(a);
//       expect(c).toEqual(1n);
//     },
//     timeout
//   );

//   it(
//     "increments the counter with one signer",
//     async () => {
//       const conf = config(env);
//       const p = provider(conf.providerURL);
//       const a = new Multisig(p, targetAccounts[0].address, [
//         targetAccounts[0].privateKey,
//       ]);
//       const c1 = await increment(a, counterContract.address, 1);
//       expect(c1.isSuccess()).toEqual(true);
//       const c2 = await get(testAccounts[0], counterContract.address);
//       expect(c2).toBe(3n);
//     },
//     timeout
//   );

//   it(
//     "removes a public key from the account",
//     async () => {
//       const conf = config(env);
//       const p = provider(conf.providerURL);
//       const a = new Multisig(p, targetAccounts[0].address, [
//         targetAccounts[0].privateKey,
//       ]);
//       await remove_public_key(a, conf.accounts[2].publicKey);
//       const c = await get_public_keys(a);
//       expect(Array.isArray(c)).toBe(true);
//       expect(c.length).toEqual(2);
//       expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
//     },
//     timeout
//   );

//   it(
//     "removes a public key from the account again",
//     async () => {
//       const conf = config(env);
//       const p = provider(conf.providerURL);
//       const a = new Multisig(p, targetAccounts[0].address, [
//         targetAccounts[0].privateKey,
//       ]);
//       await remove_public_key(a, conf.accounts[1].publicKey);
//       const c = await get_public_keys(a);
//       expect(Array.isArray(c)).toBe(true);
//       expect(c.length).toEqual(1);
//       expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
//     },
//     timeout
//   );

//   it(
//     "increments the counter with 1 signer and succeeds",
//     async () => {
//       const conf = config(env);
//       const p = provider(conf.providerURL);
//       const a = new Multisig(p, targetAccounts[0].address, [
//         targetAccounts[0].privateKey,
//       ]);
//       const c1 = await increment(a, counterContract.address, 1);
//       expect(c1.isSuccess()).toEqual(true);
//       const c2 = await get(testAccounts[0], counterContract.address);
//       expect(c2).toBe(4n);
//     },
//     timeout
//   );
// });
