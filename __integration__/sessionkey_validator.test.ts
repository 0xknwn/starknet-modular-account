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
import {
  reset,
  get,
  increment,
  deployCounterContract,
  counterAddress,
} from "./counter";
import { Multisig } from "./multisig";
import { add_module, is_module, remove_module } from "./module";
import { timeout } from "./constants";
import { SessionKeyModule, SessionKeyGrantor } from "./sessionkey_validator";
import { Account } from "starknet";
import { hash_auth_message } from "./message";

describe("sessionkey validator", () => {
  let env: string;
  let testAccounts: Account[];
  let targetAccountConfigs: AccountConfig[];
  let targetAccounts: Account[];
  let counterContract: ContractConfig;
  let connectedChain: string | undefined;
  let sessionKeyModule: SessionKeyModule | undefined;
  let altProviderURL: string;

  beforeAll(() => {
    env = "devnet";
    const conf = config(env);
    testAccounts = [testAccount(0, conf), testAccount(1, conf)];
    if (!altProviderURL) {
      altProviderURL = conf.providerURL;
    }
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
    "deploys the Counter class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "Counter");
      expect(c.classHash).toEqual(classHash("Counter"));
    },
    timeout
  );

  it(
    "deploys the Counter contract",
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
      const publicKey = await testAccounts[0].signer.getPubKey();
      const c = await deployAccount(a, "SmartrAccount", publicKey);
      expect(c).toEqual(accountAddress("SmartrAccount", publicKey));
    },
    timeout
  );

  it(
    "create and save the regular Multisig (no module)",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccountConfigs[0].address, [
        targetAccountConfigs[0].privateKey,
      ]);
      targetAccounts = [a];
    },
    timeout
  );

  it(
    "checks the account public keys",
    async () => {
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
    "deploys the SessionKeyValidator class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "SessionKeyValidator");
      expect(c.classHash).toEqual(classHash("SessionKeyValidator"));
    },
    timeout
  );

  it(
    "adds a module to the account",
    async () => {
      const a = targetAccounts[0];
      const c = await add_module(a, classHash("SessionKeyValidator"));
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "checks the module with the account",
    async () => {
      const a = targetAccounts[0];
      const value = await is_module(a, classHash("SessionKeyValidator"));
      expect(value).toBe(true);
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
    "creates a typescript session key module",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const module = new SessionKeyModule(
        targetAccountConfigs[0].publicKey,
        targetAccountConfigs[0].address,
        classHash("SessionKeyValidator"),
        connectedChain
      );
      sessionKeyModule = module;
      let r = await module.request(
        `0x${coreValidatorClassHash().toString(16)}`
      );
      if (!connectedChain) {
        expect(connectedChain).toBeDefined();
        return;
      }
      expect(r.hash).toBe(
        hash_auth_message(
          targetAccountConfigs[0].address,
          classHash("SessionKeyValidator"),
          classHash("CoreValidator"),
          targetAccountConfigs[0].publicKey,
          "0x0",
          "0x0",
          connectedChain
        )
      );
    },
    timeout
  );

  it("signs the typescript session key module", async () => {
    if (!sessionKeyModule) {
      expect(sessionKeyModule).toBeDefined();
      return;
    }
    let grantor = new SessionKeyGrantor(
      `0x${coreValidatorClassHash().toString(16)}`,
      targetAccountConfigs[0].privateKey
    );
    let signature = await grantor.sign(sessionKeyModule);
    expect(signature.length).toEqual(2);
    sessionKeyModule.add_signature(signature);
  });

  it(
    "resets and read the counter",
    async () => {
      const a = testAccounts[0];
      const c1 = await get(a, counterContract.address);
      if (c1 !== 0n) {
        let result = await reset(a, counterContract.address);
        expect(result.isSuccess()).toBe(true);
      }
      const c2 = await get(a, counterContract.address);
      expect(c2).toBe(0n);
    },
    timeout
  );

  it("creates an account with the session key module", async () => {
    if (!sessionKeyModule) {
      expect(sessionKeyModule).toBeDefined();
      return;
    }
    const conf = config(env);
    const p = provider(conf.providerURL);
    const a = new Multisig(
      p,
      targetAccountConfigs[0].address,
      [targetAccountConfigs[0].privateKey],
      sessionKeyModule
    );
    targetAccounts = [a];
  });

  it(
    "increments the counter with the session key module",
    async () => {
      const a = targetAccounts[0];
      let result = await increment(a, counterContract.address);
      expect(result.isSuccess()).toBe(true);
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
    "create and save the regular Multisig (no module)",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Multisig(p, targetAccountConfigs[0].address, [
        targetAccountConfigs[0].privateKey,
      ]);
      targetAccounts = [a];
    },
    timeout
  );

  it(
    "removes the module from account",
    async () => {
      const a = targetAccounts[0];
      const c = await remove_module(a, classHash("SessionKeyValidator"));
      expect(c.isSuccess()).toEqual(true);
    },
    timeout
  );
});
