import { deployClass, classHash } from "./class";
import { accountAddress, deployAccount } from "./simple_account";
import { config, testAccount, provider, type AccountConfig } from "./utils";
import { Account } from "starknet";
import { timeout } from "./constants";

describe("simple account management", () => {
  let env: string;
  let testAccounts: Account[];
  let targetAccounts: Account[];
  let targetAccountConfigs: AccountConfig[];
  beforeAll(() => {
    env = "devnet";
    const conf = config(env);
    testAccounts = [testAccount(0, conf), testAccount(1, conf)];
    targetAccountConfigs = [
      {
        classHash: classHash("SimpleAccount"),
        address: accountAddress(
          "SimpleAccount",
          conf.accounts[0].publicKey,
          "0x10"
        ),
        publicKey: conf.accounts[0].publicKey,
        privateKey: conf.accounts[0].privateKey,
      },
    ];
    targetAccounts = [
      new Account(
        provider(conf.providerURL),
        targetAccountConfigs[0].address,
        targetAccountConfigs[0].privateKey
      ),
    ];
  });

  it(
    "deploys the Account class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "SimpleAccount");
      expect(c.classHash).toEqual(classHash("SimpleAccount"));
    },
    timeout
  );

  it(
    "deploys the account contract",
    async () => {
      const a = testAccounts[0];
      const publicKey = targetAccountConfigs[0].publicKey;
      const c = await deployAccount(a, "SimpleAccount", publicKey, "0x10");
      expect(c).toEqual(accountAddress("SimpleAccount", publicKey, "0x10"));
    },
    timeout
  );
});
