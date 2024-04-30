import {
  declareClass,
  classHash,
  deployCounter,
  testAccounts,
  default_timeout,
  Counter,
  counterAddress,
  config,
} from "tests-starknet-helpers";
import {
  bootstrapAccountAddress,
  deployBootstrapAccount,
} from "./bootstrap_account";
import { Account, RpcProvider } from "starknet";

describe("bootstrapping an account", () => {
  let env: string;
  let account: Account;

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
    "declares the BootstrapAccount class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareClass(a, "BootstrapAccount");
      expect(c.classHash).toEqual(classHash("BootstrapAccount"));
    },
    default_timeout
  );

  it(
    "deploys the account",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const publicKey = conf.accounts[0].publicKey;
      const c = await deployBootstrapAccount(
        a,
        publicKey,
        classHash("SimpleAccount")
      );
      expect(c).toEqual(
        bootstrapAccountAddress(
          conf.accounts[0].publicKey,
          classHash("SimpleAccount")
        )
      );
      account = new Account(
        new RpcProvider({ nodeUrl: conf.providerURL }),
        bootstrapAccountAddress(
          conf.accounts[0].publicKey,
          classHash("SimpleAccount")
        ),
        conf.accounts[0].privateKey
      );
    },
    default_timeout
  );

  it(
    "checks the account class is now SimpleAccount",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const accountClass = await a.getClassHashAt(
        bootstrapAccountAddress(
          conf.accounts[0].publicKey,
          classHash("SimpleAccount")
        )
      );
      expect(accountClass).toEqual(classHash("SimpleAccount"));
    },
    default_timeout
  );
});
