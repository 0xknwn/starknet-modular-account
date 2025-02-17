import {
  deployCounter,
  testAccounts,
  default_timeout,
  Counter,
  counterAddress,
  config,
  STRK,
  initial_StrkTransfer,
} from "@0xknwn/starknet-test-helpers";
import { classHash, classNames } from "@0xknwn/starknet-contracts";
import {
  SmartrAccount,
  deployAccount,
  accountAddress,
} from "@0xknwn/starknet-modular-account";
import { RpcProvider, CallData, cairo, Signer } from "starknet";
import { GuardedValidatorABI } from "@0xknwn/starknet-module";
import { data } from "./data.fixture";

const smartAccountPrivateKey = "0xabcdef";

describe.each(data)(
  "guarded validator transaction management",
  ({ fees, version, accountID }) => {
    let env: string;
    let counterContract: Counter;
    let smartrAccount: SmartrAccount;
    let smartAccountPublicKey: string;

    beforeAll(async () => {
      env = "devnet";
      const signer = new Signer(smartAccountPrivateKey);
      smartAccountPublicKey = await signer.getPubKey();
    });

    it(
      `[${fees}][guarded]: gets the chain id`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        await account.getChainId();
      },
      default_timeout
    );

    it(
      `[${fees}][guarded]: deploys the Counter contract`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        const c = await deployCounter(account, account.address);
        expect(c.address).toEqual(
          await counterAddress(account.address, account.address)
        );
        counterContract = new Counter(c.address, testAccounts(conf)[accountID]);
      },
      default_timeout
    );

    it(
      `[${fees}][guarded]: sends "$STRK" to the account address`,
      async () => {
        const conf = config(env);
        const sender = testAccounts(conf)[accountID];
        const p = new RpcProvider({ nodeUrl: conf.providerURL });
        const privateKey = conf.accounts[accountID].privateKey;
        const moduleValidatorClassHash = classHash(classNames.GuardedValidator);
        const calldata = [
          moduleValidatorClassHash,
          "0x1",
          smartAccountPublicKey,
        ];
        const address = accountAddress(
          classNames.SmartrAccount,
          smartAccountPublicKey,
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
      `[${fees}][guarded]: configures the SmartrAccount with the signer`,
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
      `[${fees}][guarded]: deploys a SmartrAccount account`,
      async () => {
        const conf = config(env);
        const moduleValidatorClassHash = classHash(classNames.GuardedValidator);
        const calldata = [
          moduleValidatorClassHash,
          "0x1",
          smartAccountPublicKey,
        ];
        const address = await deployAccount(
          smartrAccount,
          classNames.SmartrAccount,
          smartAccountPublicKey,
          calldata
        );
        expect(address).toEqual(
          accountAddress(
            classNames.SmartrAccount,
            smartAccountPublicKey,
            calldata
          )
        );
      },
      default_timeout
    );

    it(
      `[${fees}][guarded]: checks the SmartAccount owner key`,
      async () => {
        const conf = config(env);
        const calldata = new CallData(GuardedValidatorABI);
        const nestedCalldata = calldata.compile("get_owner_key", {});
        const c = await smartrAccount.callOnModule(
          classHash(classNames.GuardedValidator),
          "get_owner_key",
          nestedCalldata
        );
        expect(Array.isArray(c)).toBe(true);
        expect(c.length).toEqual(1);
        expect(`0x${c[0].toString(16)}`).toEqual(smartAccountPublicKey);
      },
      default_timeout
    );

    it(
      `[${fees}][guarded]: resets the counter`,
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
      `[${fees}][guarded]: increments the counter from SmartrAccount and succeeds`,
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
        const receipt =
          await smartrAccount.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    it(
      `[${fees}][guarded]: reads the counter`,
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
      `[${fees}][guarded]: checks the module is installed`,
      async () => {
        if (!smartrAccount) {
          throw new Error("SmartrAccount is not deployed");
        }
        const output = await smartrAccount.isModule(
          classHash(classNames.GuardedValidator)
        );
        expect(output).toBe(true);
      },
      default_timeout
    );

    it(
      `[${fees}][guarded]: resets the counter`,
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
      `[${fees}][guarded]: removes the Validator module and fails`,
      async () => {
        if (!smartrAccount) {
          throw new Error("SmartrAccount is not deployed");
        }
        try {
          await smartrAccount.removeModule(
            classHash(classNames.GuardedValidator)
          );
          expect(true).toBe(false);
        } catch (e) {
          expect(e).toBeDefined();
        }
      },
      default_timeout
    );

    it(
      `[${fees}][guarded]: checks the module is installed`,
      async () => {
        if (!smartrAccount) {
          throw new Error("SmartrAccount is not deployed");
        }
        const output = await smartrAccount.isModule(
          classHash(classNames.GuardedValidator)
        );
        expect(output).toBe(true);
      },
      default_timeout
    );
  }
);
