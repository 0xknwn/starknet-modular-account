import { deployClass, classHash } from "./class";
import {
  accountAddress,
  deployAccount,
  get_threshold,
  get_public_keys,
  add_public_key,
  set_threshold,
  remove_public_key,
} from "./account";
import { coreValidatorClassHash } from "./core_validator";
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
import { timeout } from "./constants";
import { Account } from "starknet";

describe("multiple signatures", () => {
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
        classHash: classHash("SmartrAccount"),
        address: accountAddress("SmartrAccount", conf.accounts[0].publicKey),
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
    "deploys the CoreValidator class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "CoreValidator");
      expect(c.classHash).toEqual(
        `0x${coreValidatorClassHash().toString(16)}`
      );
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
      const conf = config(env);
      const a = testAccounts[0];
      const publicKey = conf.accounts[0].publicKey;
      const c = await deployAccount(
        a,
        "SmartrAccount",
        await a.signer.getPubKey()
      );
      expect(c).toEqual(accountAddress("SmartrAccount", publicKey));
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
    "checks the account threshold",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccounts[0].address, [
        targetAccounts[0].privateKey,
      ]);
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
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccounts[0].address, [
        targetAccounts[0].privateKey,
      ]);
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
    "adds a 2nd public key to the account",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccounts[0].address, [
        targetAccounts[0].privateKey,
      ]);
      await add_public_key(a, conf.accounts[1].publicKey);
    },
    timeout
  );

  it(
    "checks the new public key with the account",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccounts[0].address, [
        targetAccounts[0].privateKey,
      ]);
      const c = await get_public_keys(a);
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(2);
      expect(`0x${c[1].toString(16)}`).toEqual(conf.accounts[1].publicKey);
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
    "increments the counter with newly added private key",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccounts[0].address, [
        conf.accounts[1].privateKey,
      ]);
      const c = await increment(a, counterContract.address, 1);
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "updates the account threshold to 2",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccounts[0].address, [
        targetAccounts[0].privateKey,
      ]);
      const c = await set_threshold(a, 2n);
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "adds a 3rd public key to the account",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccounts[0].address, [
        targetAccounts[0].privateKey,
        conf.accounts[1].privateKey,
      ]);
      await add_public_key(a, conf.accounts[2].publicKey);
    },
    timeout
  );

  it(
    "checks the new public key with the account",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccounts[0].address, [
        targetAccounts[0].privateKey,
      ]);
      const c = await get_public_keys(a);
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(3);
      expect(`0x${c[2].toString(16)}`).toEqual(conf.accounts[2].publicKey);
    },
    timeout
  );

  it(
    "increments the counter with 2 of 3 signers",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccounts[0].address, [
        conf.accounts[1].privateKey,
        conf.accounts[2].privateKey,
      ]);
      const c1 = await increment(a, counterContract.address, 1);
      expect(c1.isSuccess()).toEqual(true);
      const c2 = await get(testAccounts[0], counterContract.address);
      expect(c2).toBe(2n);
    },
    timeout
  );

  it(
    "increments the counter with 1 signer and fails",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccounts[0].address, [
        targetAccounts[0].privateKey,
      ]);
      try {
        const c1 = await increment(a, counterContract.address, 1);
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBeDefined();
      }
      const c2 = await get(testAccounts[0], counterContract.address);
      expect(c2).toBe(2n);
    },
    timeout
  );

  it(
    "updates the account threshold back to 1",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccounts[0].address, [
        targetAccounts[0].privateKey,
        conf.accounts[1].privateKey,
      ]);
      const c = await set_threshold(a, 1n);
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "checks the account threshold is 1",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccounts[0].address, [
        targetAccounts[0].privateKey,
        conf.accounts[1].privateKey,
      ]);
      const c = await get_threshold(a);
      expect(c).toEqual(1n);
    },
    timeout
  );

  it(
    "increments the counter with one signer",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccounts[0].address, [
        targetAccounts[0].privateKey,
      ]);
      const c1 = await increment(a, counterContract.address, 1);
      expect(c1.isSuccess()).toEqual(true);
      const c2 = await get(testAccounts[0], counterContract.address);
      expect(c2).toBe(3n);
    },
    timeout
  );

  it(
    "removes a public key from the account",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccounts[0].address, [
        targetAccounts[0].privateKey,
      ]);
      await remove_public_key(a, conf.accounts[2].publicKey);
      const c = await get_public_keys(a);
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(2);
      expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
    },
    timeout
  );

  it(
    "removes a public key from the account again",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccounts[0].address, [
        targetAccounts[0].privateKey,
      ]);
      await remove_public_key(a, conf.accounts[1].publicKey);
      const c = await get_public_keys(a);
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
    },
    timeout
  );

  it(
    "increments the counter with 1 signer and succeeds",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccounts[0].address, [
        targetAccounts[0].privateKey,
      ]);
      const c1 = await increment(a, counterContract.address, 1);
      expect(c1.isSuccess()).toEqual(true);
      const c2 = await get(testAccounts[0], counterContract.address);
      expect(c2).toBe(4n);
    },
    timeout
  );
});
