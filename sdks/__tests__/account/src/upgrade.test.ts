import {
  declareClass as declareHelperClass,
  classHash as helperClassHash,
  testAccounts,
  default_timeout,
  config,
  SimpleAccountABI,
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
import { RpcProvider, Contract, Account, type Call, CallData } from "starknet";
import { StarkValidatorABI } from "@0xknwn/starknet-modular-account";

describe("upgrade management", () => {
  let env: string;
  let smartrAccount: SmartrAccount;

  beforeAll(() => {
    env = "devnet";
  });

  it(
    "declares the SimpleAccount class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareHelperClass(a, "SimpleAccount");
      expect(c.classHash).toEqual(helperClassHash("SimpleAccount"));
    },
    default_timeout
  );

  it(
    "declares the starkValidator class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareAccountClass(a, "StarkValidator");
      expect(c.classHash).toEqual(accountClassHash("StarkValidator"));
    },
    default_timeout
  );

  it(
    "declares the SmartrAccount class",
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
      const data = calldata.compile("get_public_key", {});
      const c = await smartrAccount.callOnModule(
        accountClassHash("StarkValidator"),
        "get_public_key",
        data
      );
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      expect(`0x${c[0].toString(16)}`).toEqual(conf.accounts[0].publicKey);
    },
    default_timeout
  );

  it(
    "checks the account class hash",
    async () => {
      const c = await smartrAccount.getClassHashAt(smartrAccount.address);
      expect(c).toEqual(accountClassHash("SmartrAccount"));
    },
    default_timeout
  );

  it(
    "upgrades the account with SimpleAccount",
    async () => {
      const { transaction_hash } = await smartrAccount.upgrade(
        helperClassHash("SimpleAccount")
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toEqual(true);
    },
    default_timeout
  );

  it(
    "checks the account class hash",
    async () => {
      const c = await smartrAccount.getClassHashAt(smartrAccount.address);
      expect(c).toEqual(helperClassHash("SimpleAccount"));
    },
    default_timeout
  );

  it(
    "checks the SimpleAccount public keys",
    async () => {
      const conf = config(env);
      const contract = new Contract(
        SimpleAccountABI,
        smartrAccount.address,
        smartrAccount
      );
      const c = await contract.call("get_public_key");
      expect(`0x${c.toString(16)}`).toEqual(conf.accounts[0].publicKey);
    },
    default_timeout
  );

  it(
    "downgrade the account with SmartrAccount",
    async () => {
      const conf = config(env);
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const a = new Account(
        p,
        smartrAccount.address,
        conf.accounts[0].privateKey
      );
      const contract = new Contract(
        SimpleAccountABI,
        smartrAccount.address,
        smartrAccount
      );
      const call: Call = contract.populate("upgrade", {
        new_class_hash: accountClassHash("SmartrAccount"),
      });

      const { transaction_hash } = await a.execute(call);
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toEqual(true);
    },
    default_timeout
  );

  it(
    "checks the account class hash",
    async () => {
      const c = await smartrAccount.getClassHashAt(smartrAccount.address);
      expect(c).toEqual(accountClassHash("SmartrAccount"));
    },
    default_timeout
  );
});
