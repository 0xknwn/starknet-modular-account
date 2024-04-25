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
import { PolicyManager } from "./policies";
import {
  SmartrAccount,
  deploySmartrAccount,
  smartrAccountAddress,
  hash_auth_message,
} from "@0xknwn/starknet-account";
import { RpcProvider } from "starknet";
import { SessionKeyModule, SessionKeyGrantor } from "./sessionkey";

describe("sessionkey management", () => {
  let env: string;
  let counterContract: Counter;
  let smartrAccount: SmartrAccount;
  let smartrAccountWithSessionKey: SmartrAccount;
  let connectedChain: string;
  let sessionKeyModule: SessionKeyModule;

  beforeAll(() => {
    env = "devnet";
  });

  it(
    "gets the chain id",
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[0];
      connectedChain = await account.getChainId();
    },
    default_timeout
  );

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
      smartrAccount = new SmartrAccount(p, accountAddress, privateKey);
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
    "checks the SmartAccount threshold",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
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
    "deploys the SessionKeyValidator class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareClass(a, "SessionKeyValidator");
      expect(c.classHash).toEqual(classHash("SessionKeyValidator"));
    },
    default_timeout
  );

  it(
    "adds a module to the account",
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const { transaction_hash } = await smartrAccount.addModule(
        classHash("SessionKeyValidator")
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "checks the SessionKeyValidator is installed",
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const output = await smartrAccount.isModule(
        classHash("SessionKeyValidator")
      );
      expect(output).toBe(true);
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
    "creates a typescript session key module",
    async () => {
      if (!connectedChain) {
        expect(connectedChain).toBeDefined();
        return;
      }
      const policyManager = new PolicyManager([
        { contractAddress: counterContract.address, selector: "increment" },
        { contractAddress: counterContract.address, selector: "increment_by" },
      ]);
      const conf = config(env);
      let next_timestamp = BigInt(Math.floor(Date.now() / 1000) + 24 * 60 * 60);
      sessionKeyModule = new SessionKeyModule(
        conf.accounts[1].publicKey,
        smartrAccount.address,
        classHash("SessionKeyValidator"),
        connectedChain,
        `0x${next_timestamp.toString(16)}`,
        policyManager
      );
      let root = policyManager.getRoot();
      let r = await sessionKeyModule.request(classHash("CoreValidator"));
      expect(r.hash).toBe(
        hash_auth_message(
          smartrAccount.address,
          classHash("SessionKeyValidator"),
          classHash("CoreValidator"),
          conf.accounts[1].publicKey,
          `0x${next_timestamp.toString(16)}`,
          root,
          connectedChain
        )
      );
    },
    default_timeout
  );

  it("signs the typescript session key module", async () => {
    if (!sessionKeyModule) {
      expect(sessionKeyModule).toBeDefined();
      return;
    }
    const conf = config(env);
    let grantor = new SessionKeyGrantor(
      classHash("CoreValidator"),
      conf.accounts[0].privateKey
    );
    let signature = await grantor.sign(sessionKeyModule);
    expect(signature.length).toEqual(2);
    sessionKeyModule.add_signature(signature);
  });

  it("creates an account with the session key module", async () => {
    if (!sessionKeyModule) {
      expect(sessionKeyModule).toBeDefined();
      return;
    }
    const conf = config(env);
    const p = new RpcProvider({ nodeUrl: conf.providerURL });
    smartrAccountWithSessionKey = new SmartrAccount(
      p,
      smartrAccount.address,
      conf.accounts[1].privateKey,
      sessionKeyModule
    );
  });

  it(
    "resets and read the counter from owner account",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c1 = await counterContract.get();
      if (c1 !== 0n) {
        let { transaction_hash } = await counterContract.reset();
        let receipt = await a.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      }
      const c2 = await counterContract.get();
      expect(c2).toBe(0n);
    },
    default_timeout
  );

  it(
    "increments the counter from SmartrAccount with Module and succeed",
    async () => {
      if (!counterContract) {
        throw new Error("Counter not deployed");
      }
      if (!smartrAccountWithSessionKey) {
        throw new Error("SmartrAccount with SessionKey not installed");
      }
      const counterWithSmartrAccountAndModule = new Counter(
        counterContract.address,
        smartrAccountWithSessionKey
      );
      const { transaction_hash } =
        await counterWithSmartrAccountAndModule.increment();
      const receipt =
        await smartrAccountWithSessionKey.waitForTransaction(transaction_hash);
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
    "removes the module from the account",
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const { transaction_hash } = await smartrAccount.removeModule(
        classHash("SessionKeyValidator")
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "checks the SessionKeyValidator is not installed",
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const output = await smartrAccount.isModule(
        classHash("SessionKeyValidator")
      );
      expect(output).toBe(false);
    },
    default_timeout
  );
});
