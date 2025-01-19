import { declareClass, classHash } from "./class";
import { deploySimpleAccount, simpleAccountAddress } from "./simple_account";
import { config, testAccounts } from "./utils";
import { Account, RpcProvider } from "starknet";
import { default_timeout } from "./parameters";
import { data } from "./data.fixture";

describe.each(data)("simple account management", ({ fees, version, accountID }) => {
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
    `[${fees}] deploys the Account class`,
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[accountID];
      const c = await declareClass(a, "SimpleAccount", { version: version.declare });
      expect(c.classHash).toEqual(classHash("SimpleAccount"));
    },
    default_timeout
  );

  it(
    `[${fees}] deploys the account contract`,
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[accountID];
      const publicKey = conf.accounts[accountID].publicKey;
      const c = await deploySimpleAccount(a, publicKey, "0x10", { version: version.invoke });
      expect(c).toEqual(
        simpleAccountAddress(conf.accounts[accountID].publicKey, "0x10")
      );
    },
    default_timeout
  );
});
