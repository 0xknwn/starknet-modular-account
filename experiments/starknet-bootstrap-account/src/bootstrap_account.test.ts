import {
  declareClass as declareHelperClass,
  classHash as helperClassHash,
  testAccounts,
  default_timeout,
  config,
  initial_EthTransfer,
  ETH,
  classNames as helperaccountClassNames,
} from "@0xknwn/starknet-test-helpers";
import {
  declareClass as declareAccountClass,
  classNames as accountClassNames,
  classHash as accountClassHash,
} from "@0xknwn/starknet-modular-account";
import { bootstrapAccountAddress } from "./bootstrap_account";
import {
  classHash,
  declareClass as declareBootstrapClass,
  classNames,
} from "./class";
import { deployAccount } from "./contract";
import { Account, RpcProvider, CallData } from "starknet";
import { ABI as AccountABI } from "./abi/BootstrapAccount";

describe("bootstrapping an account", () => {
  let env: string;
  let account: Account;

  beforeAll(() => {
    env = "devnet";
  });

  it(
    "declares the SimpleValidator class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareAccountClass(a, accountClassNames.SimpleValidator);
      expect(c.classHash).toEqual(
        accountClassHash(accountClassNames.SimpleValidator)
      );
    },
    default_timeout
  );

  it(
    "declares the BootstrapAccount class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareBootstrapClass(a, classNames.BootstrapAccount);
      expect(c.classHash).toEqual(classHash(classNames.BootstrapAccount));
    },
    default_timeout
  );

  it(
    "sends ETH to the BootstrapAccount address",
    async () => {
      const conf = config(env);
      const sender = testAccounts(conf)[0];
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const publicKey = conf.accounts[0].publicKey;
      const privateKey = conf.accounts[0].privateKey;
      const address = bootstrapAccountAddress(
        publicKey,
        accountClassHash(accountClassNames.SimpleValidator)
      );
      const { transaction_hash } = await ETH(sender).transfer(
        address,
        initial_EthTransfer
      );
      let receipt = await sender.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toEqual(true);
      account = new Account(p, address, privateKey);
    },
    default_timeout
  );

  it(
    "deploys the BootstrapAccount account",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const publicKey = conf.accounts[0].publicKey;
      const calldata = new CallData(AccountABI).compile("constructor", {
        public_key: publicKey,
        target_class: accountClassHash(accountClassNames.SimpleValidator),
      });
      const address = await deployAccount(
        account,
        "BootstrapAccount",
        publicKey,
        calldata
      );
      expect(address).toEqual(
        bootstrapAccountAddress(
          conf.accounts[0].publicKey,
          accountClassHash(accountClassNames.SimpleValidator)
        )
      );
    },
    default_timeout
  );

  it(
    "checks the account class is now SimpleValidator",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const accountClass = await a.getClassHashAt(
        bootstrapAccountAddress(
          conf.accounts[0].publicKey,
          accountClassHash(accountClassNames.SimpleValidator)
        )
      );
      expect(accountClass).toEqual(
        accountClassHash(accountClassNames.SimpleValidator)
      );
    },
    default_timeout
  );
});
