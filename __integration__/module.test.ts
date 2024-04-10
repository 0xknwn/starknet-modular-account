import { deployClass, classHash } from "./class";
import { accountAddress, deployAccount, get_public_keys } from "./account";
import { coreValidatorClassHash } from "./core_validator";
import {
  chain,
  config,
  testAccount,
  provider,
  type AccountConfig,
  type ContractConfig,
} from "./utils";
import { Multisig } from "./multisig";
import {
  add_module,
  is_module,
  remove_module,
  get_initialization,
} from "./module";
import { timeout } from "./constants";
import { Account } from "starknet";

describe("module management", () => {
  let env: string;
  let testAccounts: Account[];
  let targetAccountConfigs: AccountConfig[];
  let targetAccounts: Account[];
  let counterContract: ContractConfig;
  let connectedChain: string | undefined;

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
  });

  it(
    "gets the chain id",
    async () => {
      const conf = config(env);
      connectedChain = await chain(conf.providerURL);
      switch (env) {
        case "sepolia":
          expect(connectedChain).toBe("0x534e5f474f45524c49");
          break;
        default:
          expect(connectedChain).toBe("0x534e5f474f45524c49");
          break;
      }
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
      const publicKey = await testAccounts[0].signer.getPubKey();
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
      const a = new Multisig(p, targetAccountConfigs[0].address, [
        targetAccountConfigs[0].privateKey,
      ]);
      targetAccounts = [a];
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
    "checks the module 0x0 is not installed",
    async () => {
      const a = targetAccounts[0];
      const c = await is_module(a, "0x0");
      expect(c).toBe(false);
    },
    timeout
  );

  it(
    "deploys the SimpleValidator class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "SimpleValidator");
      expect(c.classHash).toEqual(classHash("SimpleValidator"));
    },
    timeout
  );

  it(
    "adds a module to the account",
    async () => {
      const a = targetAccounts[0];
      const c = await add_module(a, classHash("SimpleValidator"));
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "checks the module with the account",
    async () => {
      const a = targetAccounts[0];
      const value = await is_module(a, classHash("SimpleValidator"));
      expect(value).toBe(true);
    },
    timeout
  );

  it(
    "checks the module initialize has been called",
    async () => {
      const a = targetAccounts[0];
      const c = await get_initialization(a);
      expect(`0x${c.toString(16)}`).toEqual("0x8");
    },
    timeout
  );

  it(
    "adds the module to the account again",
    async () => {
      const a = targetAccounts[0];
      try {
        const c = await add_module(a, classHash("SimpleValidator"));
        expect(true).toEqual(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
    },
    timeout
  );

  it(
    "removes the module from account",
    async () => {
      const a = targetAccounts[0];
      const c = await remove_module(a, classHash("SimpleValidator"));
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "checks the module with the account",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = targetAccounts[0];
      const value = await is_module(a, classHash("SimpleValidator"));
      expect(value).toBe(false);
    },
    timeout
  );
});
