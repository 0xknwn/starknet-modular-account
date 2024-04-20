import { declareClass, classHash } from "./class";
import { deploySimpleAccount, simpleAccountAddress } from "./simple_account";
import { config, testAccounts } from "./utils";
import { Account, RpcProvider } from "starknet";
import { default_timeout } from "./parameters";

describe("simple account management", () => {
  let env: string;
  let simpleAccount: Account;
  beforeAll(() => {
    env = "devnet";
    const conf = config(env);
    simpleAccount = new Account(
      new RpcProvider({ nodeUrl: conf.providerURL }),
      simpleAccountAddress(conf.accounts[0].publicKey, "0x10"),
      conf.accounts[0].privateKey
    );
  });

  it(
    "deploys the Account class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareClass(a, "SimpleAccount");
      expect(c.classHash).toEqual(classHash("SimpleAccount"));
    },
    default_timeout
  );

  it(
    "deploys the account contract",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const publicKey = conf.accounts[0].publicKey;
      const c = await deploySimpleAccount(a, publicKey, "0x10");
      expect(c).toEqual(
        simpleAccountAddress(conf.accounts[0].publicKey, "0x10")
      );
    },
    default_timeout
  );
});
