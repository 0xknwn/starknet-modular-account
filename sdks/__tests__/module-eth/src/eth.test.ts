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
import { RpcProvider, CallData, EthSigner } from "starknet";
import {
  declareClass as declareEthClass,
  classHash as ethClassHash,
  EthModule,
} from "@0xknwn/starknet-module-eth";
import { StarkValidatorABI } from "@0xknwn/starknet-modular-account";

describe("eth account management", () => {
  let env: string;
  let counterContract: Counter;
  let smartrAccount: SmartrAccount;
  let ethModule: EthModule;
  let smartrAccountWithEth: SmartrAccount;
  let connectedChain: string;

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
    "deploys the starkValidator class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareAccountClass(a, "StarkValidator");
      expect(c.classHash).toEqual(accountClassHash("StarkValidator"));
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
    "sends ETH to the account address",
    async () => {
      const conf = config(env);
      const sender = testAccounts(conf)[0];
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const publicKey = conf.accounts[0].publicKey;
      const privateKey = conf.accounts[0].privateKey;
      const starkValidatorClassHash = accountClassHash("StarkValidator");
      const calldata = new CallData(SmartrAccountABI).compile("constructor", {
        core_validator: starkValidatorClassHash,
        public_key: [publicKey],
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
    "deploys a SmartrAccount account",
    async () => {
      const conf = config(env);
      const publicKey = conf.accounts[0].publicKey;
      const starkValidatorClassHash = accountClassHash("StarkValidator");
      const calldata = new CallData(SmartrAccountABI).compile("constructor", {
        core_validator: starkValidatorClassHash,
        public_key: [publicKey],
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
    "checks the SmartAccount public keys",
    async () => {
      const conf = config(env);
      const calldata = new CallData(StarkValidatorABI);
      const data = calldata.compile("get_public_keys", {});
      const c = await smartrAccount.callOnModule(
        accountClassHash("StarkValidator"),
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
      const calldata = new CallData(StarkValidatorABI);
      const data = calldata.compile("get_threshold", {});
      const c = await smartrAccount.callOnModule(
        accountClassHash("StarkValidator"),
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
    "deploys the EthValidator class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareEthClass(a, "EthValidator");
      expect(c.classHash).toEqual(ethClassHash("EthValidator"));
    },
    default_timeout
  );

  it(
    "adds a module to the account",
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const isInstalled = await smartrAccount.isModule(
        ethClassHash("EthValidator")
      );
      if (isInstalled) {
        return;
      }
      const { transaction_hash } = await smartrAccount.addModule(
        ethClassHash("EthValidator")
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "checks the EthValidator is installed",
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const output = await smartrAccount.isModule(ethClassHash("EthValidator"));
      expect(output).toBe(true);
    },
    default_timeout
  );

  it(
    "set the ETH public key",
    async () => {
      const { transaction_hash } = await smartrAccount.executeOnModule(
        ethClassHash("EthValidator"),
        "set_public_key",
        [
          "210289098249831467762502193281061856838",
          "280617501412351006689952710290844664966",
          "258172356515136873455592221375042794236",
          "69849287226094710129367771214955413606",
        ]
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "gets the ETH public key",
    async () => {
      const result = await smartrAccount.callOnModule(
        ethClassHash("EthValidator"),
        "get_public_key",
        []
      );
      expect(result.length).toEqual(4);
      expect(result[0]).toEqual(210289098249831467762502193281061856838n);
      expect(result[1]).toEqual(280617501412351006689952710290844664966n);
      expect(result[2]).toEqual(258172356515136873455592221375042794236n);
      expect(result[3]).toEqual(69849287226094710129367771214955413606n);
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
    "creates a typescript ETH Validator module",
    async () => {
      const conf = config(env);
      const next_timestamp = BigInt(
        Math.floor(Date.now() / 1000) + 24 * 60 * 60
      );
      ethModule = new EthModule(smartrAccount.address);
    },
    default_timeout
  );

  it("creates an account with the ETH Validator module", async () => {
    if (!ethModule) {
      expect(ethModule).toBeDefined();
      return;
    }
    const conf = config(env);
    const p = new RpcProvider({ nodeUrl: conf.providerURL });
    const signer = new EthSigner(
      "0xb28ebb20fb1015da6e6367d1b5dba9b52862a06dbb3a4022e4749b6987ac1bd2"
    );
    smartrAccountWithEth = new SmartrAccount(
      p,
      smartrAccount.address,
      signer,
      ethModule
    );
  });

  it(
    "increments the counter from SmartrAccount with Module and succeed",
    async () => {
      if (!counterContract) {
        throw new Error("Counter not deployed");
      }
      if (!smartrAccountWithEth) {
        throw new Error("SmartrAccount with Eth Validator not installed");
      }
      const counterWithSmartrAccountAndModule = new Counter(
        counterContract.address,
        smartrAccountWithEth
      );
      const { transaction_hash } =
        await counterWithSmartrAccountAndModule.increment();
      const receipt = await smartrAccountWithEth.waitForTransaction(
        transaction_hash
      );
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "increments the counter with wrong key and fails",
    async () => {
      if (!ethModule) {
        expect(ethModule).toBeDefined();
        return;
      }
      const conf = config(env);
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const signer = new EthSigner(
        "0xfc5f3cbec4bea5789df4783f423e500aab57ddff75f872f629c27208b4f285fc"
      );
      let failedSmartrAccountWithEth = new SmartrAccount(
        p,
        smartrAccount.address,
        signer,
        ethModule
      );
      if (!counterContract) {
        throw new Error("Counter not deployed");
      }
      const counterWithSmartrAccountAndModule = new Counter(
        counterContract.address,
        failedSmartrAccountWithEth
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
    "removes the Eth Validator module from the account",
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const { transaction_hash } = await smartrAccount.removeModule(
        ethClassHash("EthValidator")
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    "checks the Eth Validator  is not installed",
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const output = await smartrAccount.isModule(ethClassHash("EthValidator"));
      expect(output).toBe(false);
    },
    default_timeout
  );
});
