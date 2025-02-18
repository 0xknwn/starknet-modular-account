import {
  deployCounter,
  testAccounts,
  default_timeout,
  Counter,
  counterAddress,
  config,
  initial_StrkTransfer,
  STRK,
} from "@0xknwn/starknet-test-helpers";
import { classNames, classHash } from "@0xknwn/starknet-contracts";
import {
  SmartrAccount,
  deployAccount,
  accountAddress,
  SmartrAccountABI,
} from "@0xknwn/starknet-modular-account";
import { RpcProvider, CallData, Contract, shortString, num } from "starknet";
import { StarkValidatorABI } from "@0xknwn/starknet-modular-account";
import { data } from "./data.fixture";

describe.each([data[1]])("account management", ({ fees, version, accountID }) => {
  let env: string;
  let counterContract: Counter;
  let smartrAccount: SmartrAccount;

  beforeAll(() => {
    env = "devnet";
  });

  it(
    `[${fees}] deploys the Counter contract`,
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[accountID];
      const c = await deployCounter(account, account.address, {
        version: version.invoke,
      });
      expect(c.address).toEqual(
        await counterAddress(account.address, account.address)
      );
      counterContract = new Counter(c.address, testAccounts(conf)[accountID]);
    },
    default_timeout
  );

  it(
    `[${fees}] sends "$STRK" to the account address`,
    async () => {
      const conf = config(env);
      const sender = testAccounts(conf)[accountID];
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const publicKey = conf.accounts[accountID].publicKey;
      const privateKey = conf.accounts[accountID].privateKey;
      const starkValidatorClassHash = classHash(classNames.StarkValidator);
      const calldata = new CallData(SmartrAccountABI).compile("constructor", {
        core_validator: starkValidatorClassHash,
        args: [publicKey],
      });
      const address = accountAddress(
        classNames.SmartrAccount,
        publicKey,
        calldata
      );
      const TOKEN = STRK;
      const initial_transfer = initial_StrkTransfer;
      const { transaction_hash } = await TOKEN(sender).transfer(
        address,
        initial_transfer
      );
      const receipt = await sender.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toEqual(true);
      smartrAccount = new SmartrAccount(
        p,
        address,
        privateKey,
        undefined,
        "1",
        "0x3"
      );
    },
    default_timeout
  );

  it(
    `[${fees}] deploys a SmartrAccount account`,
    async () => {
      const conf = config(env);
      const publicKey = conf.accounts[accountID].publicKey;
      const starkValidatorClassHash = classHash(classNames.StarkValidator);
      const calldata = new CallData(SmartrAccountABI).compile("constructor", {
        core_validator: starkValidatorClassHash,
        args: [publicKey],
      });
      const address = await deployAccount(
        smartrAccount,
        classNames.SmartrAccount,
        publicKey,
        calldata,
        { version: version.deploy_account }
      );
      expect(address).toEqual(
        accountAddress(classNames.SmartrAccount, publicKey, calldata)
      );
    },
    default_timeout
  );

  it(
    `[${fees}] checks the SmartAccount public keys`,
    async () => {
      const conf = config(env);
      const calldata = new CallData(StarkValidatorABI);
      const data = calldata.compile("get_public_key", {});
      const c = await smartrAccount.callOnModule(
        classHash(classNames.StarkValidator),
        "get_public_key",
        data
      );
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      expect(`0x${c[0].toString(16)}`).toEqual(
        conf.accounts[accountID].publicKey
      );
    },
    default_timeout
  );

  it(
    `[${fees}] checks the SmartAccount name`,
    async () => {
      const conf = config(env);
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const contract = new Contract(SmartrAccountABI, smartrAccount.address, p);

      const result = await contract.call("get_name");
      expect(`0x${result.toString(16)}`).toEqual(
        shortString.encodeShortString("starknet-modular-account")
      );
    },
    default_timeout
  );

  it(
    `[${fees}] resets the counter`,
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[accountID];
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
    `[${fees}] increments the counter from SmartrAccount and succeed`,
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
    `[${fees}] reads the counter`,
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
    `[${fees}] resets the counter from SmartrAccount and fails`,
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
