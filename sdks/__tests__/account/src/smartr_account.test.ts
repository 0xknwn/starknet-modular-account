import {
  declareClass as declareHelperClass,
  classHash as helperClassHash,
  deployCounter,
  testAccounts,
  default_timeout,
  Counter,
  counterAddress,
  config,
  initial_EthTransfer,
} from "tests-starknet-helpers";
import {
  declareClass as declareAccountClass,
  classHash as accountClassHash,
  SmartrAccount,
  deploySmartrAccount,
  smartrAccountAddress,
} from "@0xknwn/starknet-modular-account";
import { RpcProvider, CallData } from "starknet";
import { CoreValidatorABI } from "@0xknwn/starknet-modular-account";

describe("account management", () => {
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
      const c = await declareHelperClass(account, "Counter");
      expect(c.classHash).toEqual(helperClassHash("Counter"));
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
      const c = await declareAccountClass(a, "CoreValidator");
      expect(c.classHash).toEqual(accountClassHash("CoreValidator"));
    },
    default_timeout
  );

  it(
    "deploys the SmartrAccount class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareAccountClass(a, "SmartrAccount");
      expect(c.classHash).toEqual(accountClassHash("SmartrAccount"));
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
      const coreValidatorAddress = accountClassHash("CoreValidator");
      const accountAddress = await deploySmartrAccount(
        a,
        publicKey,
        coreValidatorAddress,
        initial_EthTransfer
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
      const calldata = new CallData(CoreValidatorABI);
      const data = calldata.compile("get_public_keys", {});
      const c = await smartrAccount.callOnModule(
        accountClassHash("CoreValidator"),
        "get_public_keys",
        data
      );
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
      const calldata = new CallData(CoreValidatorABI);
      const data = calldata.compile("get_threshold", {});
      const c = await smartrAccount.callOnModule(
        accountClassHash("CoreValidator"),
        "get_threshold",
        data
      );
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      expect(`${c[0].toString(10)}`).toEqual("1");
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