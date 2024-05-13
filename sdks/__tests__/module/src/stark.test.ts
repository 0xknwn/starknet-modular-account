import {
  declareClass as declareHelperClass,
  classHash as helperClassHash,
  deployCounter,
  testAccounts,
  default_timeout,
  Counter,
  counterAddress,
  config,
  ETH,
} from "@0xknwn/starknet-test-helpers";
import {
  declareClass as declareAccountClass,
  classHash as accountClassHash,
  SmartrAccount,
  deployAccount,
  accountAddress,
  StarkValidatorABI,
} from "@0xknwn/starknet-modular-account";
import { RpcProvider, CallData, Account, hash, cairo, Signer } from "starknet";
import {
  declareClass as declareModuleClass,
  classHash as moduleClassHash,
  StarkModule,
} from "@0xknwn/starknet-module";

const smartAccountPrivateKey = "0xabcdef";
const initial_EthTransfer = cairo.uint256(10n * 10n ** 15n);

describe("stark validator management", () => {
  let env: string;
  let counterContract: Counter;
  let smartrAccount: SmartrAccount;
  let smartrAccountWithModule: SmartrAccount;
  let smartAccountPublicKey: string;

  beforeAll(async () => {
    env = "devnet";
    const signer = new Signer(smartAccountPrivateKey);
    smartAccountPublicKey = await signer.getPubKey();
  });

  it(
    `[stark]: gets the chain id`,
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[0];
      await account.getChainId();
    },
    default_timeout
  );

  it(
    `[stark]: declare the Counter class`,
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[0];
      const c = await declareHelperClass(account, "Counter");
      expect(c.classHash).toEqual(helperClassHash("Counter"));
    },
    default_timeout
  );

  it(
    `[stark]: deploys the Counter contract`,
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
    `[stark]: deploys the StarkValidator class`,
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareModuleClass(a, "StarkValidator");
      expect(c.classHash).toEqual(moduleClassHash("StarkValidator"));
    },
    default_timeout
  );

  it(
    `[stark]: deploys the SmartrAccount class`,
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareAccountClass(a, "SmartrAccount");
      expect(c.classHash).toEqual(accountClassHash("SmartrAccount"));
    },
    default_timeout
  );

  it(
    `[stark]: sends ETH to the account address`,
    async () => {
      const conf = config(env);
      const sender = testAccounts(conf)[0];
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const privateKey = conf.accounts[0].privateKey;
      const moduleValidatorClassHash = moduleClassHash("StarkValidator");
      const calldata = [moduleValidatorClassHash, "0x1", smartAccountPublicKey];
      const address = accountAddress(
        "SmartrAccount",
        smartAccountPublicKey,
        calldata
      );
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
    `[stark]: configures the SmartrAccount with the signer`,
    async () => {
      const conf = config(env);
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      smartrAccount = new SmartrAccount(
        p,
        smartrAccount.address,
        smartAccountPrivateKey
      );
    },
    default_timeout
  );

  it(
    `[stark]: deploys a SmartrAccount account`,
    async () => {
      const conf = config(env);
      const moduleValidatorClassHash = moduleClassHash("StarkValidator");
      const calldata = [moduleValidatorClassHash, "0x1", smartAccountPublicKey];
      const address = await deployAccount(
        smartrAccount,
        "SmartrAccount",
        smartAccountPublicKey,
        calldata
      );
      expect(address).toEqual(
        accountAddress("SmartrAccount", smartAccountPublicKey, calldata)
      );
    },
    default_timeout
  );

  it(
    `[stark]: checks the SmartAccount public key`,
    async () => {
      const conf = config(env);
      const calldata = new CallData(StarkValidatorABI);
      const nestedCalldata = calldata.compile("get_public_key", {});
      const c = await smartrAccount.callOnModule(
        moduleClassHash("StarkValidator"),
        "get_public_key",
        nestedCalldata
      );
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      expect(`0x${c[0].toString(16)}`).toEqual(smartAccountPublicKey);
    },
    default_timeout
  );

  it(
    `[stark]: resets the counter`,
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
    `[stark]: increments the counter from SmartrAccount and succeeds`,
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
    `[stark]: reads the counter`,
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
    `[stark]: checks the module is installed`,
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const output = await smartrAccount.isModule(
        moduleClassHash("StarkValidator")
      );
      expect(output).toBe(true);
    },
    default_timeout
  );

  it(
    `[stark]: resets the counter`,
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

  it(`[stark]: creates an typescript account with the module`, async () => {
    if (!module) {
      expect(module).toBeDefined();
      return;
    }
    const conf = config(env);
    const p = new RpcProvider({ nodeUrl: conf.providerURL });
    const m = new StarkModule(smartrAccount.address);
    const signer = new Signer(smartAccountPrivateKey);
    smartrAccountWithModule = new SmartrAccount(
      p,
      smartrAccount.address,
      signer,
      m
    );
  });

  it(
    `[stark]: increments the counter with the account/module and succeeds`,
    async () => {
      if (!counterContract) {
        throw new Error("Counter not deployed");
      }
      if (!smartrAccountWithModule) {
        throw new Error("SmartrAccount with Eth Validator not installed");
      }
      const counterWithSmartrAccountAndModule = new Counter(
        counterContract.address,
        smartrAccountWithModule
      );
      const { transaction_hash } =
        await counterWithSmartrAccountAndModule.increment();
      const receipt = await smartrAccountWithModule.waitForTransaction(
        transaction_hash
      );
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    `[stark]: increments the counter with wrong key and fails`,
    async () => {
      const conf = config(env);
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const m = new StarkModule(smartrAccount.address);
      const signer = new Signer("0x1");
      let failedsmartrAccountWithModule = new SmartrAccount(
        p,
        smartrAccount.address,
        signer,
        m
      );
      if (!counterContract) {
        throw new Error("Counter not deployed");
      }
      const counterWithSmartrAccountAndModule = new Counter(
        counterContract.address,
        failedsmartrAccountWithModule
      );
      try {
        await counterWithSmartrAccountAndModule.increment();
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
    },
    default_timeout
  );

  it(
    `[stark]: removes the Validator module and fails`,
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      try {
        await await smartrAccount.removeModule(
          moduleClassHash("StarkValidator")
        );
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
    },
    default_timeout
  );

  it(
    `[stark]: checks the module is installed`,
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const output = await smartrAccount.isModule(
        moduleClassHash("StarkValidator")
      );
      expect(output).toBe(true);
    },
    default_timeout
  );
});
