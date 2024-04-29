import {
  declareClass,
  classHash,
  testAccounts,
  default_timeout,
  Counter,
  config,
  SimpleAccountABI,
} from "starknet-test-helpers";
import {
  SmartrAccount,
  deploySmartrAccount,
  smartrAccountAddress,
} from "./smartr_account";
import { RpcProvider, Contract, Account, type Call, CallData } from "starknet";
import { ABI as CoreValidatorABI } from "./abi/CoreValidator";

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
      const c = await declareClass(a, "SimpleAccount");
      expect(c.classHash).toEqual(classHash("SimpleAccount"));
    },
    default_timeout
  );

  it(
    "declares the coreValidator class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareClass(a, "CoreValidator");
      expect(c.classHash).toEqual(classHash("CoreValidator"));
    },
    default_timeout
  );

  it(
    "declares the SmartrAccount class",
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
      const calldata = new CallData(CoreValidatorABI);
      const data = calldata.compile("get_public_keys", {});
      const c = await smartrAccount.callOnModule(
        classHash("CoreValidator"),
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
    "checks the account class hash",
    async () => {
      const c = await smartrAccount.getClassHashAt(smartrAccount.address);
      expect(c).toEqual(classHash("SmartrAccount"));
    },
    default_timeout
  );

  it(
    "upgrades the account with SimpleAccount",
    async () => {
      const { transaction_hash } = await smartrAccount.upgrade(
        classHash("SimpleAccount")
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
      expect(c).toEqual(classHash("SimpleAccount"));
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
        new_class_hash: classHash("SmartrAccount"),
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
      expect(c).toEqual(classHash("SmartrAccount"));
    },
    default_timeout
  );
});
