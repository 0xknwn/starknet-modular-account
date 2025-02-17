import {
  testAccounts,
  default_timeout,
  config,
  SimpleAccountABI,
  initial_EthTransfer,
  initial_StrkTransfer,
  ETH,
  STRK,
} from "@0xknwn/starknet-test-helpers";
import {
  SmartrAccount,
  deployAccount,
  accountAddress,
  SmartrAccountABI,
} from "@0xknwn/starknet-modular-account";
import { classHash, classNames } from "@0xknwn/starknet-contracts";
import { RpcProvider, Contract, Account, type Call, CallData } from "starknet";
import { StarkValidatorABI } from "@0xknwn/starknet-modular-account";
import { data } from "./data.fixture";

describe.each(data)("upgrade management", ({ fees, version, accountID }) => {
  let env: string;
  let smartrAccount: SmartrAccount;

  beforeAll(() => {
    env = "devnet";
  });

  it(
    `[${fees}] sends ${fees === "WEI" ? "$ETH" : "FRI"} to the account address`,
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
      const TOKEN = fees === "WEI" ? ETH : STRK;
      const initial_transfer =
        fees === "WEI" ? initial_EthTransfer : initial_StrkTransfer;
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
        fees === "WEI" ? "0x2" : "0x3"
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
      const x = new CallData(SmartrAccountABI);
      const calldata = x.compile("constructor", {
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
    `[${fees}] checks the account class hash`,
    async () => {
      const c = await smartrAccount.getClassHashAt(smartrAccount.address);
      expect(c).toEqual(classHash(classNames.SmartrAccount));
    },
    default_timeout
  );

  it(
    `[${fees}] upgrades the account with SimpleAccount`,
    async () => {
      const { transaction_hash } = await smartrAccount.upgrade(
        classHash(classNames.SimpleAccount)
      );
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toEqual(true);
    },
    default_timeout
  );

  it(
    `[${fees}] checks the account class hash`,
    async () => {
      const c = await smartrAccount.getClassHashAt(smartrAccount.address);
      expect(c).toEqual(classHash(classNames.SimpleAccount));
    },
    default_timeout
  );

  it(
    `[${fees}] checks the SimpleAccount public keys`,
    async () => {
      const conf = config(env);
      const contract = new Contract(
        SimpleAccountABI,
        smartrAccount.address,
        smartrAccount
      );
      const c = await contract.call("get_public_key");
      expect(`0x${c.toString(16)}`).toEqual(conf.accounts[accountID].publicKey);
    },
    default_timeout
  );

  it(
    `[${fees}] downgrade the account with SmartrAccount`,
    async () => {
      const conf = config(env);
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const a = new Account(
        p,
        smartrAccount.address,
        conf.accounts[accountID].privateKey,
        "1",
        fees === "WEI" ? "0x2" : "0x3"
      );
      const contract = new Contract(
        SimpleAccountABI,
        smartrAccount.address,
        smartrAccount
      );
      const call: Call = contract.populate("upgrade", {
        new_class_hash: classHash(classNames.SmartrAccount),
      });

      const { transaction_hash } = await a.execute(call);
      const receipt = await smartrAccount.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toEqual(true);
    },
    default_timeout
  );

  it(
    `[${fees}] checks the account class hash`,
    async () => {
      const c = await smartrAccount.getClassHashAt(smartrAccount.address);
      expect(c).toEqual(classHash(classNames.SmartrAccount));
    },
    default_timeout
  );
});
