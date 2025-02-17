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
import { classHash, classNames } from "@0xknwn/starknet-contracts";
import { PolicyManager } from "@0xknwn/starknet-module-sessionkey";
import {
  SmartrAccount,
  deployAccount,
  accountAddress,
  hash_auth_message,
  SmartrAccountABI,
} from "@0xknwn/starknet-modular-account";
import { RpcProvider, CallData } from "starknet";
import {
  SessionKeyModule,
  SessionKeyGrantor,
} from "@0xknwn/starknet-module-sessionkey";
import { StarkValidatorABI } from "@0xknwn/starknet-modular-account";
import { data } from "./data.fixture";

describe.each([data[1]])(
  "sessionkey management",
  ({ fees, accountID, version }) => {
    let env: string;
    let counterContract: Counter;
    let smartrAccount: SmartrAccount;
    let smartrAccountWithSessionKey: SmartrAccount;
    let connectedChain: string;
    let sessionKeyModule: SessionKeyModule;

    beforeAll(() => {
      env = "devnet";
    });

    it(
      `[${fees}] gets the chain id`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        connectedChain = await account.getChainId();
      },
      default_timeout
    );

    it(
      `[${fees}]deploys the Counter contract`,
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
      `[${fees}]deploys a SmartrAccount account`,
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
      `[${fees}]checks the SmartAccount public keys`,
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
      `[${fees}]resets the counter`,
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
      `[${fees}]increments the counter from SmartrAccount and succeed`,
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
      `[${fees}]reads the counter`,
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
      `[${fees}] adds a module to the account`,
      async () => {
        if (!smartrAccount) {
          throw new Error("SmartrAccount is not deployed");
        }
        const { transaction_hash } = await smartrAccount.addModule(
          classHash(classNames.SessionKeyValidator)
        );
        const receipt =
          await smartrAccount.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    it(
      `[${fees}]checks the SessionKeyValidator is installed`,
      async () => {
        if (!smartrAccount) {
          throw new Error("SmartrAccount is not deployed");
        }
        const output = await smartrAccount.isModule(
          classHash(classNames.SessionKeyValidator)
        );
        expect(output).toBe(true);
      },
      default_timeout
    );

    it(
      `[${fees}]resets the counter`,
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
      `[${fees}]creates a typescript session key module`,
      async () => {
        if (!connectedChain) {
          expect(connectedChain).toBeDefined();
          return;
        }
        const policyManager = new PolicyManager([
          { contractAddress: counterContract.address, selector: "increment" },
          {
            contractAddress: counterContract.address,
            selector: "increment_by",
          },
        ]);
        const conf = config(env);
        const next_timestamp = BigInt(
          Math.floor(Date.now() / 1000) + 24 * 60 * 60
        );
        sessionKeyModule = new SessionKeyModule(
          conf.accounts[1].publicKey,
          smartrAccount.address,
          classHash(classNames.SessionKeyValidator),
          connectedChain,
          `0x${next_timestamp.toString(16)}`,
          policyManager
        );
        const root = policyManager.getRoot();
        const r = await sessionKeyModule.request(
          classHash(classNames.StarkValidator)
        );
        expect(r.hash).toBe(
          hash_auth_message(
            smartrAccount.address,
            classHash(classNames.SessionKeyValidator),
            classHash(classNames.StarkValidator),
            conf.accounts[1].publicKey,
            `0x${next_timestamp.toString(16)}`,
            root,
            connectedChain
          )
        );
      },
      default_timeout
    );

    it(`[${fees}]signs the typescript session key module`, async () => {
      if (!sessionKeyModule) {
        expect(sessionKeyModule).toBeDefined();
        return;
      }
      const conf = config(env);
      const grantor = new SessionKeyGrantor(
        classHash(classNames.StarkValidator),
        conf.accounts[accountID].privateKey
      );
      const signature = await grantor.sign(sessionKeyModule);
      expect(signature.length).toEqual(2);
      sessionKeyModule.add_signature(signature);
    });

    it(`[${fees}]creates an account with the session key module`, async () => {
      if (!sessionKeyModule) {
        expect(sessionKeyModule).toBeDefined();
        return;
      }
      const conf = config(env);
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      smartrAccountWithSessionKey = new SmartrAccount(
        p,
        smartrAccount.address,
        conf.accounts[1].privateKey,
        sessionKeyModule,
        "1",
        "0x3"
      );
    });

    it(
      `[${fees}]resets and read the counter from owner account`,
      async () => {
        const conf = config(env);
        const a = testAccounts(conf)[accountID];
        const c1 = await counterContract.get();
        if (c1 !== 0n) {
          const { transaction_hash } = await counterContract.reset();
          const receipt = await a.waitForTransaction(transaction_hash);
          expect(receipt.isSuccess()).toBe(true);
        }
        const c2 = await counterContract.get();
        expect(c2).toBe(0n);
      },
      default_timeout
    );

    it(
      `[${fees}]increments the counter from SmartrAccount with Module and succeed`,
      async () => {
        if (!counterContract) {
          throw new Error("Counter not deployed");
        }
        if (!smartrAccountWithSessionKey) {
          throw new Error("SmartrAccount with SessionKey not installed");
        }
        const counterWithSmartrAccountAndModule = new Counter(
          counterContract.address,
          smartrAccountWithSessionKey
        );
        const { transaction_hash } =
          await counterWithSmartrAccountAndModule.increment();
        const receipt =
          await smartrAccountWithSessionKey.waitForTransaction(
            transaction_hash
          );
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    it(
      `[${fees}]reads the counter`,
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
      `[${fees}]removes the module from the account`,
      async () => {
        if (!smartrAccount) {
          throw new Error("SmartrAccount is not deployed");
        }
        const { transaction_hash } = await smartrAccount.removeModule(
          classHash(classNames.SessionKeyValidator)
        );
        const receipt =
          await smartrAccount.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    it(
      `[${fees}]checks the SessionKeyValidator is not installed`,
      async () => {
        if (!smartrAccount) {
          throw new Error("SmartrAccount is not deployed");
        }
        const output = await smartrAccount.isModule(
          classHash(classNames.SessionKeyValidator)
        );
        expect(output).toBe(false);
      },
      default_timeout
    );
  }
);
