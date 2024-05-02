import {
  declareClass as declareHelperClass,
  classHash as helperClassHash,
  testAccounts,
  default_timeout,
  config,
} from "tests-starknet-helpers";
import {
  bootstrapAccountAddress,
  deployBootstrapAccount,
} from "./bootstrap_account";
import {
  classHash as bootstrapClassHash,
  declareClass as declareBootstrapClass,
} from "./class";
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
      const c = await declareHelperClass(a, "SimpleAccount");
      expect(c.classHash).toEqual(helperClassHash("SimpleAccount"));
    },
    default_timeout
  );

  it(
    "declares the BootstrapAccount class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareBootstrapClass(a, "BootstrapAccount");
      expect(c.classHash).toEqual(bootstrapClassHash("BootstrapAccount"));
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
        helperClassHash("SimpleAccount")
      );
      expect(c).toEqual(
        bootstrapAccountAddress(
          conf.accounts[0].publicKey,
          helperClassHash("SimpleAccount")
        )
      );
      account = new Account(
        new RpcProvider({ nodeUrl: conf.providerURL }),
        bootstrapAccountAddress(
          conf.accounts[0].publicKey,
          helperClassHash("SimpleAccount")
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
          helperClassHash("SimpleAccount")
        )
      );
      expect(accountClass).toEqual(helperClassHash("SimpleAccount"));
    },
    default_timeout
  );
});
