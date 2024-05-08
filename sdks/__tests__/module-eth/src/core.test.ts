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
} from "@0xknwn/starknet-modular-account";
import { RpcProvider, CallData, EthSigner, hash, cairo } from "starknet";
import {
  declareClass as declareEthClass,
  classHash as ethClassHash,
  EthValidatorABI,
} from "@0xknwn/starknet-module-eth";
const initial_EthTransfer = cairo.uint256(10n * 10n ** 15n);

describe("eth/core validator management", () => {
  let env: string;
  let counterContract: Counter;
  let smartrAccount: SmartrAccount;
  let smartrAccountWithEth: SmartrAccount;

  beforeAll(() => {
    env = "devnet";
  });

  it(
    "gets the chain id",
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[0];
      await account.getChainId();
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
      const privateKey = conf.accounts[0].privateKey;
      const ethValidatorClassHash = ethClassHash("EthValidator");
      const calldata = [
        ethValidatorClassHash,
        "4",
        "210289098249831467762502193281061856838",
        "280617501412351006689952710290844664966",
        "258172356515136873455592221375042794236",
        "69849287226094710129367771214955413606",
      ];
      const salt = hash.computeHashOnElements([
        "210289098249831467762502193281061856838",
        "280617501412351006689952710290844664966",
        "258172356515136873455592221375042794236",
        "69849287226094710129367771214955413606",
      ]);
      const address = accountAddress("SmartrAccount", salt, calldata);
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
    "configures the SnartrAccount with the EthSigner",
    async () => {
      const conf = config(env);
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const signer = new EthSigner(
        "0xb28ebb20fb1015da6e6367d1b5dba9b52862a06dbb3a4022e4749b6987ac1bd2"
      );
      smartrAccountWithEth = new SmartrAccount(
        p,
        smartrAccount.address,
        signer
      );
    },
    default_timeout
  );

  it(
    "deploys a SmartrAccount account",
    async () => {
      const conf = config(env);
      const ethValidatorClassHash = ethClassHash("EthValidator");
      const calldata = [
        ethValidatorClassHash,
        "4",
        "210289098249831467762502193281061856838",
        "280617501412351006689952710290844664966",
        "258172356515136873455592221375042794236",
        "69849287226094710129367771214955413606",
      ];
      const salt = hash.computeHashOnElements([
        "210289098249831467762502193281061856838",
        "280617501412351006689952710290844664966",
        "258172356515136873455592221375042794236",
        "69849287226094710129367771214955413606",
      ]);
      const address = await deployAccount(
        smartrAccountWithEth,
        "SmartrAccount",
        salt,
        calldata
      );
      expect(address).toEqual(accountAddress("SmartrAccount", salt, calldata));
    },
    default_timeout
  );

  it(
    "checks the SmartAccount public key",
    async () => {
      const conf = config(env);
      const calldata = new CallData(EthValidatorABI);
      const data = calldata.compile("get_public_key", {});
      const c = await smartrAccount.callOnModule(
        ethClassHash("EthValidator"),
        "get_public_key",
        data
      );
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(4);
      expect(c[0].toString(10)).toEqual(
        "210289098249831467762502193281061856838"
      );
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
      if (!smartrAccountWithEth) {
        throw new Error("SmartrAccount not installed");
      }
      const counterWithSmartrAccount = new Counter(
        counterContract.address,
        smartrAccountWithEth
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
});
