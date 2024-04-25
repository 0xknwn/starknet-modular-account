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
      const c = await smartrAccount.getPublicKeys();
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
    },
    default_timeout
  );

  it(
    "checks the SmartAccount threshhold",
    async () => {
      const c = await smartrAccount.getThreshold();
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

  it(
    "checks the SmartAccount threshhold",
    async () => {
      const c = await smartrAccount.getThreshold();
      expect(c).toEqual(1n);
    },
    default_timeout
  );

  it(
    "adds a 2nd public key to the account",
    async () => {
      const conf = config(env);
      const { transaction_hash } = await smartrAccount.addPublicKey(
        conf.accounts[1].publicKey
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "checks the new public key with the account",
    async () => {
      const c = await smartrAccount.getPublicKeys();
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(2);
      const conf = config(env);
      expect(`0x${c[1].toString(16)}`).toEqual(conf.accounts[1].publicKey);
    },
    default_timeout
  );

  it(
    "resets the counter with owner",
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
    "increments the counter with newly added owner",
    async () => {
      if (!counterContract) {
        throw new Error("Counter not deployed");
      }
      const conf = config(env);
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const altSmartrAccount = new SmartrAccount(p, smartrAccount.address, [
        conf.accounts[1].privateKey,
      ]);
      const counterFromAltSmartrAccount = new Counter(
        counterContract.address,
        altSmartrAccount
      );
      const { transaction_hash } =
        await counterFromAltSmartrAccount.increment();
      const receipt =
        await altSmartrAccount.waitForTransaction(transaction_hash);
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
      expect(c).toBe(1n);
    },
    default_timeout
  );

  it(
    "resets the counter with owner",
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
    "updates the account threshold to 2",
    async () => {
      const { transaction_hash } = await smartrAccount.setThreshold(2n);
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "adds a 3rd public key to the account",
    async () => {
      const conf = config(env);
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const altSmartrAccount = new SmartrAccount(p, smartrAccount.address, [
        conf.accounts[0].privateKey,
        conf.accounts[1].privateKey,
      ]);
      const { transaction_hash } = await altSmartrAccount.addPublicKey(
        conf.accounts[2].publicKey
      );
      const receipt =
        await altSmartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "checks the new public key with the account",
    async () => {
      const c = await smartrAccount.getPublicKeys();
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(3);
      const conf = config(env);
      expect(`0x${c[2].toString(16)}`).toEqual(conf.accounts[2].publicKey);
    },
    default_timeout
  );

  it(
    "increments the counter with 2 of 3 signers",
    async () => {
      if (!counterContract) {
        throw new Error("Counter not deployed");
      }
      const conf = config(env);
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const altSmartrAccount = new SmartrAccount(p, smartrAccount.address, [
        conf.accounts[1].privateKey,
        conf.accounts[2].privateKey,
      ]);
      const counterFromAltSmartrAccount = new Counter(
        counterContract.address,
        altSmartrAccount
      );
      const { transaction_hash } =
        await counterFromAltSmartrAccount.increment();
      const receipt =
        await altSmartrAccount.waitForTransaction(transaction_hash);
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
      expect(c).toBe(1n);
    },
    default_timeout
  );

  it(
    "increments the counter with 1 of 3 signers and fails",
    async () => {
      if (!counterContract) {
        throw new Error("Counter not deployed");
      }
      const conf = config(env);
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const altSmartrAccount = new SmartrAccount(p, smartrAccount.address, [
        conf.accounts[0].privateKey,
      ]);
      const counterFromAltSmartrAccount = new Counter(
        counterContract.address,
        altSmartrAccount
      );
      try {
        const { transaction_hash } =
          await counterFromAltSmartrAccount.increment();
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
    },
    default_timeout
  );

  it(
    "resets the counter with owner",
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
    "updates the account threshold to 1",
    async () => {
      const conf = config(env);
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const altSmartrAccount = new SmartrAccount(p, smartrAccount.address, [
        conf.accounts[1].privateKey,
        conf.accounts[2].privateKey,
      ]);
      const { transaction_hash } = await altSmartrAccount.setThreshold(1n);
      const receipt =
        await altSmartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "checks the SmartAccount threshhold is back to 1",
    async () => {
      const c = await smartrAccount.getThreshold();
      expect(c).toEqual(1n);
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
    "removes the 2nd public key from the account",
    async () => {
      const conf = config(env);
      const { transaction_hash } = await smartrAccount.removePublicKey(
        conf.accounts[1].publicKey
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "checks the public key with the account are 2",
    async () => {
      const c = await smartrAccount.getPublicKeys();
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(2);
      const conf = config(env);
      expect(`0x${c[1].toString(16)}`).toEqual(conf.accounts[2].publicKey);
    },
    default_timeout
  );

  it(
    "removes the ex-3rd public key from the account",
    async () => {
      const conf = config(env);
      const { transaction_hash } = await smartrAccount.removePublicKey(
        conf.accounts[2].publicKey
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "checks the public key with the account are 1",
    async () => {
      const c = await smartrAccount.getPublicKeys();
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      const conf = config(env);
      expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
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
});
