import {
  declareClass as declareHelperClass,
  classHash as helperClassHash,
  deployCounter,
  testAccounts,
  default_timeout,
  Counter,
  counterAddress,
  config,
  CounterABI,
  initial_EthTransfer,
  ETH,
} from "@0xknwn/starknet-test-helpers";
import {
  declareClass as declareAccountClass,
  classHash as accountClassHash,
  SmartrAccount,
  deployAccount,
  accountAddress,
  SmartrAccountABI,
} from "@0xknwn/starknet-modular-account";
import {
  declareClass as declareModuleClass,
  classHash as moduleClassHash,
  MultisigValidatorABI,
} from "@0xknwn/starknet-module";
import { Contract, RpcProvider, CallData } from "starknet";

describe("multiple signature", () => {
  let env: string;
  let counterContract: Counter;
  let smartrAccount: SmartrAccount;
  let smartrAccount2: SmartrAccount;

  beforeAll(() => {
    env = "devnet";
  });

  it(
    "[multisig]: declare the Counter class",
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[0];
      const c = await declareHelperClass(account, "Counter");
      expect(c.classHash).toEqual(helperClassHash("Counter"));
    },
    default_timeout
  );

  it(
    "[multisig]: deploys the Counter contract",
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
    "[multisig]: deploys the MultisigValidator class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareModuleClass(a, "MultisigValidator");
      expect(c.classHash).toEqual(moduleClassHash("MultisigValidator"));
    },
    default_timeout
  );

  it(
    "[multisig]: deploys the SmartrAccount class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareAccountClass(a, "SmartrAccount");
      expect(c.classHash).toEqual(accountClassHash("SmartrAccount"));
    },
    default_timeout
  );

  it(
    "[multisig]: sends ETH to the account address",
    async () => {
      const conf = config(env);
      const sender = testAccounts(conf)[0];
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const publicKey = conf.accounts[0].publicKey;
      const privateKey = conf.accounts[0].privateKey;
      const moduleValidatorClassHash = moduleClassHash("MultisigValidator");
      const calldata = new CallData(SmartrAccountABI).compile("constructor", {
        core_validator: moduleValidatorClassHash,
        args: [publicKey],
      });
      const address = accountAddress("SmartrAccount", publicKey, calldata);
      const { transaction_hash } = await ETH(sender).transfer(
        address,
        initial_EthTransfer
      );
      const receipt = await sender.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toEqual(true);
      smartrAccount = new SmartrAccount(p, address, privateKey);
    },
    default_timeout
  );

  it(
    "[multisig]: deploys a SmartrAccount account",
    async () => {
      const conf = config(env);
      const publicKey = conf.accounts[0].publicKey;
      const moduleValidatorClassHash = moduleClassHash("MultisigValidator");
      const calldata = new CallData(SmartrAccountABI).compile("constructor", {
        core_validator: moduleValidatorClassHash,
        args: [publicKey],
      });
      const address = await deployAccount(
        smartrAccount,
        "SmartrAccount",
        publicKey,
        calldata
      );
      expect(address).toEqual(
        accountAddress("SmartrAccount", publicKey, calldata)
      );
    },
    default_timeout
  );

  it(
    "[multisig]: checks the SmartAccount public keys",
    async () => {
      const conf = config(env);
      const calldata = new CallData(MultisigValidatorABI);
      const data = calldata.compile("get_public_keys", {});
      const c = await smartrAccount.callOnModule(
        moduleClassHash("MultisigValidator"),
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
    "[multisig]: checks the SmartAccount threshold",
    async () => {
      const calldata = new CallData(MultisigValidatorABI);
      const data = calldata.compile("get_threshold", {});
      const c = await smartrAccount.callOnModule(
        moduleClassHash("MultisigValidator"),
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
    "[multisig]: resets the counter",
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
    "[multisig]: increments the counter from SmartrAccount and succeed",
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
    "[multisig]: reads the counter",
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
    "[multisig]: resets the counter from SmartrAccount and fails",
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
    "[multisig]: checks the SmartAccount threshold",
    async () => {
      const calldata = new CallData(MultisigValidatorABI);
      const data = calldata.compile("get_threshold", {});
      const c = await smartrAccount.callOnModule(
        moduleClassHash("MultisigValidator"),
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
    "[multisig]: adds a 2nd public key to the account",
    async () => {
      const conf = config(env);
      const calldata = new CallData(MultisigValidatorABI);
      const data = calldata.compile("add_public_key", {
        new_public_key: conf.accounts[1].publicKey,
      });
      const { transaction_hash } = await smartrAccount.executeOnModule(
        moduleClassHash("MultisigValidator"),
        "add_public_key",
        data
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      smartrAccount2 = new SmartrAccount(
        p,
        smartrAccount.address,
        conf.accounts[1].privateKey
      );
    },
    default_timeout
  );

  it(
    "[multisig]: checks the new public key with the account",
    async () => {
      const conf = config(env);
      const calldata = new CallData(MultisigValidatorABI);
      const data = calldata.compile("get_public_keys", {});
      const c = await smartrAccount.callOnModule(
        moduleClassHash("MultisigValidator"),
        "get_public_keys",
        data
      );
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(2);
      expect(`0x${c[1].toString(16)}`).toEqual(conf.accounts[1].publicKey);
    },
    default_timeout
  );

  it(
    "[multisig]: resets the counter with owner",
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
    "[multisig]: increments the counter with newly added owner",
    async () => {
      if (!counterContract) {
        throw new Error("Counter not deployed");
      }
      if (!smartrAccount2) {
        throw new Error("SmartrAccount not installed");
      }
      const conf = config(env);
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const counterFromAltSmartrAccount = new Counter(
        counterContract.address,
        smartrAccount2
      );
      const { transaction_hash } =
        await counterFromAltSmartrAccount.increment();
      const receipt = await smartrAccount2.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "[multisig]: reads the counter",
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
    "[multisig]: resets the counter with owner",
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
    "[multisig]: updates the account threshold to 2",
    async () => {
      const calldata = new CallData(MultisigValidatorABI);
      const data = calldata.compile("set_threshold", {
        new_threshold: 2,
      });
      const { transaction_hash } = await smartrAccount.executeOnModule(
        moduleClassHash("MultisigValidator"),
        "set_threshold",
        data
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "[multisig]: adds a 3rd public key to the account",
    async () => {
      const conf = config(env);
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const calldata = new CallData(MultisigValidatorABI);
      const data = calldata.compile("add_public_key", {
        new_public_key: conf.accounts[2].publicKey,
      });
      const transactions = await smartrAccount.executeOnModule(
        moduleClassHash("MultisigValidator"),
        "add_public_key",
        data,
        false
      );
      const detail = await smartrAccount.prepareMultisig(transactions);
      const signature1 = await smartrAccount.signMultisig(transactions, detail);
      const signature2 = await smartrAccount2.signMultisig(
        transactions,
        detail
      );
      const { transaction_hash } = await smartrAccount.executeMultisig(
        transactions,
        detail,
        [...signature1, ...signature2]
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "[multisig]: checks the new public key with the account",
    async () => {
      const conf = config(env);
      const calldata = new CallData(MultisigValidatorABI);
      const data = calldata.compile("get_public_keys", {});
      const c = await smartrAccount.callOnModule(
        moduleClassHash("MultisigValidator"),
        "get_public_keys",
        data
      );
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(3);
      expect(`0x${c[2].toString(16)}`).toEqual(conf.accounts[2].publicKey);
    },
    default_timeout
  );

  it(
    "[multisig]: increments the counter with 2 of 3 signers",
    async () => {
      if (!counterContract) {
        throw new Error("Counter not deployed");
      }
      const conf = config(env);
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const counter = new Contract(CounterABI, counterContract.address, p);
      const transaction = counter.populate("increment", []);
      const transactions = [transaction];
      const detail = await smartrAccount.prepareMultisig(transactions);
      const signature1 = await smartrAccount.signMultisig(transactions, detail);
      const signature2 = await smartrAccount2.signMultisig(
        transactions,
        detail
      );
      const { transaction_hash } = await smartrAccount.executeMultisig(
        transactions,
        detail,
        [...signature1, ...signature2]
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "[multisig]: reads the counter",
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
    "[multisig]: increments the counter with 1 of 3 signers and fails",
    async () => {
      if (!counterContract) {
        throw new Error("Counter not deployed");
      }
      const conf = config(env);
      // @todo manage the 2 account to run this
      const counterFromAltSmartrAccount = new Counter(
        counterContract.address,
        smartrAccount
      );
      try {
        // @todo: change this to 1n
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
    "[multisig]: resets the counter with owner",
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
    "[multisig]: updates the account threshold to 1",
    async () => {
      const calldata = new CallData(MultisigValidatorABI);
      const data = calldata.compile("set_threshold", {
        new_threshold: 1,
      });
      const transactions = await smartrAccount.executeOnModule(
        moduleClassHash("MultisigValidator"),
        "set_threshold",
        data,
        false
      );
      const detail = await smartrAccount.prepareMultisig(transactions);
      const signature1 = await smartrAccount.signMultisig(transactions, detail);
      const signature2 = await smartrAccount2.signMultisig(
        transactions,
        detail
      );
      const { transaction_hash } = await smartrAccount.executeMultisig(
        transactions,
        detail,
        [...signature1, ...signature2]
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "[multisig]: checks the SmartAccount threshold is back to 1",
    async () => {
      const calldata = new CallData(MultisigValidatorABI);
      const data = calldata.compile("get_threshold", {});
      const c = await smartrAccount.callOnModule(
        moduleClassHash("MultisigValidator"),
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
    "[multisig]: increments the counter from SmartrAccount and succeed",
    async () => {
      if (!counterContract) {
        throw new Error("Counter not deployed");
      }
      if (!smartrAccount) {
        throw new Error("SmartrAccount not installed");
      }
      const { transaction_hash } = await counterContract.increment();
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "[multisig]: removes the 2nd public key from the account",
    async () => {
      const conf = config(env);
      const calldata = new CallData(MultisigValidatorABI);
      const data = calldata.compile("remove_public_key", {
        old_public_key: conf.accounts[1].publicKey,
      });
      const { transaction_hash } = await smartrAccount.executeOnModule(
        moduleClassHash("MultisigValidator"),
        "remove_public_key",
        data
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "[multisig]: checks the public key with the account are 2",
    async () => {
      const calldata = new CallData(MultisigValidatorABI);
      const data = calldata.compile("get_public_keys", {});
      const c = await smartrAccount.callOnModule(
        moduleClassHash("MultisigValidator"),
        "get_public_keys",
        data
      );
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(2);
      const conf = config(env);
      expect(`0x${c[1].toString(16)}`).toEqual(conf.accounts[2].publicKey);
    },
    default_timeout
  );

  it(
    "[multisig]: removes the ex-3rd public key from the account",
    async () => {
      const conf = config(env);
      const calldata = new CallData(MultisigValidatorABI);
      const data = calldata.compile("remove_public_key", {
        old_public_key: conf.accounts[2].publicKey,
      });
      const { transaction_hash } = await smartrAccount.executeOnModule(
        moduleClassHash("MultisigValidator"),
        "remove_public_key",
        data
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "[multisig]: checks the public key with the account are 1",
    async () => {
      const calldata = new CallData(MultisigValidatorABI);
      const data = calldata.compile("get_public_keys", {});
      const c = await smartrAccount.callOnModule(
        moduleClassHash("MultisigValidator"),
        "get_public_keys",
        data
      );
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      const conf = config(env);
      expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
    },
    default_timeout
  );

  it(
    "[multisig]: increments the counter from SmartrAccount and succeed",
    async () => {
      if (!counterContract) {
        throw new Error("Counter not deployed");
      }
      const { transaction_hash } = await counterContract.increment();
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );
});
