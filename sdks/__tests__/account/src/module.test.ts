import {
  testAccounts,
  default_timeout,
  config,
  initial_StrkTransfer,
  STRK,
} from "@0xknwn/starknet-test-helpers";
import {
  SmartrAccount,
  deployAccount,
  accountAddress,
  SmartrAccountABI,
} from "@0xknwn/starknet-modular-account";
import { classHash, classNames } from "@0xknwn/starknet-contracts";
import { RpcProvider, CallData } from "starknet";
import { StarkValidatorABI } from "@0xknwn/starknet-modular-account";
import { data } from "./data.fixture";

describe.each([data[0]])("module management", ({ fees, version, accountID }) => {
  let env: string;
  let smartrAccount: SmartrAccount;

  beforeAll(() => {
    env = "devnet";
  });

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
      const a = testAccounts(conf)[accountID];
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
    `[${fees}] checks module 0x0 is not installed`,
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const output = await smartrAccount.isModule("0x0");
      expect(output).toBe(false);
    },
    default_timeout
  );

  it(
    `[${fees}] adds a module to the account`,
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const { transaction_hash } = await smartrAccount.addModule(
        classHash(classNames.SimpleValidator)
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    `[${fees}] checks the SimpleValidator is installed`,
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const output = await smartrAccount.isModule(
        classHash(classNames.SimpleValidator)
      );
      expect(output).toBe(true);
    },
    default_timeout
  );

  it(
    `[${fees}] adds a module to the account again and fails`,
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      try {
        await smartrAccount.addModule(classHash(classNames.SimpleValidator));
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeDefined();
      }
    },
    default_timeout
  );

  it(
    `[${fees}] removes the module from the account`,
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const { transaction_hash } = await smartrAccount.removeModule(
        classHash(classNames.SimpleValidator)
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toBe(true);
    },
    default_timeout
  );

  it(
    `[${fees}] checks the SimpleValidator is not installed`,
    async () => {
      if (!smartrAccount) {
        throw new Error("SmartrAccount is not deployed");
      }
      const output = await smartrAccount.isModule(
        classHash(classNames.SimpleValidator)
      );
      expect(output).toBe(false);
    },
    default_timeout
  );
});
