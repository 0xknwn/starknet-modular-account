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
  STRK,
  initial_EthTransfer,
  initial_StrkTransfer,
  classNames as helperClassNames,
} from "@0xknwn/starknet-test-helpers";
import {
  declareClass as declareAccountClass,
  classHash as accountClassHash,
  SmartrAccount,
  deployAccount,
  accountAddress,
  StarkValidatorABI,
  classNames as accountClassNames,
} from "@0xknwn/starknet-modular-account";
import { RpcProvider, CallData, Signer } from "starknet";
import {
  declareClass as declareModuleClass,
  StarkModule,
} from "@0xknwn/starknet-module";

const smartAccountPrivateKey = "0xabcdef";
import { data } from "./data.fixture";

describe.each([data[1]])(
  "stark validator management",
  ({ fees, accountID, version }) => {
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
      `[${fees}][stark]: gets the chain id`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        await account.getChainId();
      },
      default_timeout
    );

    it(
      `[${fees}][stark]: declare the Counter class`,
      async () => {
        const conf = config(env);
        const account = testAccounts(conf)[accountID];
        const c = await declareHelperClass(account, helperClassNames.Counter, {
          version: version.declare,
        });
        expect(c.classHash).toEqual(helperClassHash(helperClassNames.Counter));
      },
      default_timeout
    );

    it(
      `[${fees}][stark]: deploys the Counter contract`,
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
      `[${fees}][stark]: declares the StarkValidator class`,
      async () => {
        const conf = config(env);
        const a = testAccounts(conf)[accountID];
        const c = await declareAccountClass(
          a,
          accountClassNames.StarkValidator,
          {
            version: version.declare,
          }
        );
        expect(c.classHash).toEqual(
          accountClassHash(accountClassNames.StarkValidator)
        );
      },
      default_timeout
    );

    it(
      `[${fees}][stark]: declares the SmartrAccount class`,
      async () => {
        const conf = config(env);
        const a = testAccounts(conf)[accountID];
        const c = await declareAccountClass(
          a,
          accountClassNames.SmartrAccount,
          {
            version: version.declare,
          }
        );
        expect(c.classHash).toEqual(
          accountClassHash(accountClassNames.SmartrAccount)
        );
      },
      default_timeout
    );

    it(
      `[${fees}][stark]: sends ${fees === "WEI" ? "$ETH" : "$STRK"} to the account address`,
      async () => {
        const conf = config(env);
        const sender = testAccounts(conf)[accountID];
        const p = new RpcProvider({ nodeUrl: conf.providerURL });
        const privateKey = conf.accounts[accountID].privateKey;
        const moduleValidatorClassHash = accountClassHash(
          accountClassNames.StarkValidator
        );
        const calldata = [
          moduleValidatorClassHash,
          "0x1",
          smartAccountPublicKey,
        ];
        const address = accountAddress(
          accountClassNames.SmartrAccount,
          smartAccountPublicKey,
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
      `[${fees}][stark]: configures the SmartrAccount with the signer`,
      async () => {
        const conf = config(env);
        const p = new RpcProvider({ nodeUrl: conf.providerURL });
        smartrAccount = new SmartrAccount(
          p,
          smartrAccount.address,
          smartAccountPrivateKey,
          undefined,
          "1",
          fees === "WEI" ? "0x2" : "0x3"
        );
      },
      default_timeout
    );

    it(
      `[${fees}][stark]: deploys a SmartrAccount account`,
      async () => {
        const conf = config(env);
        const moduleValidatorClassHash = accountClassHash(
          accountClassNames.StarkValidator
        );
        const calldata = [
          moduleValidatorClassHash,
          "0x1",
          smartAccountPublicKey,
        ];
        const address = await deployAccount(
          smartrAccount,
          accountClassNames.SmartrAccount,
          smartAccountPublicKey,
          calldata,
          {
            version: version.deploy_account,
          }
        );
        expect(address).toEqual(
          accountAddress(
            accountClassNames.SmartrAccount,
            smartAccountPublicKey,
            calldata
          )
        );
      },
      default_timeout
    );

    it(
      `[${fees}][stark]: checks the SmartAccount public key`,
      async () => {
        const conf = config(env);
        const calldata = new CallData(StarkValidatorABI);
        const nestedCalldata = calldata.compile("get_public_key", {});
        const c = await smartrAccount.callOnModule(
          accountClassHash(accountClassNames.StarkValidator),
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
      `[${fees}][stark]: resets the counter`,
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
      `[${fees}][stark]: increments the counter from SmartrAccount and succeeds`,
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
      `[${fees}][stark]: reads the counter`,
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
      `[${fees}][stark]: checks the module is installed`,
      async () => {
        if (!smartrAccount) {
          throw new Error("SmartrAccount is not deployed");
        }
        const output = await smartrAccount.isModule(
          accountClassHash(accountClassNames.StarkValidator)
        );
        expect(output).toBe(true);
      },
      default_timeout
    );

    it(
      `[${fees}][stark]: resets the counter`,
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

    it(`[${fees}][stark]: creates an typescript account with the module`, async () => {
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
        m,
        "1",
        fees === "WEI" ? "0x2" : "0x3"
      );
    });

    it(
      `[${fees}][stark]: increments the counter with the account/module and succeeds`,
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
        const receipt =
          await smartrAccountWithModule.waitForTransaction(transaction_hash);
        expect(receipt.isSuccess()).toBe(true);
      },
      default_timeout
    );

    it(
      `[${fees}][stark]: increments the counter with wrong key and fails`,
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
      `[${fees}][stark]: removes the Validator module and fails`,
      async () => {
        if (!smartrAccount) {
          throw new Error("SmartrAccount is not deployed");
        }
        try {
          await await smartrAccount.removeModule(
            accountClassHash(accountClassNames.StarkValidator)
          );
          expect(true).toBe(false);
        } catch (e) {
          expect(e).toBeDefined();
        }
      },
      default_timeout
    );

    it(
      `[${fees}][stark]: checks the module is installed`,
      async () => {
        if (!smartrAccount) {
          throw new Error("SmartrAccount is not deployed");
        }
        const output = await smartrAccount.isModule(
          accountClassHash(accountClassNames.StarkValidator)
        );
        expect(output).toBe(true);
      },
      default_timeout
    );
  }
);
