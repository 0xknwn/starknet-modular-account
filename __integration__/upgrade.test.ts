import { deployClass } from "./class";
import { accountAddress, deployAccount, upgrade } from "./smartr_account";
import { config, provider, testAccount, type AccountConfig } from "./utils";
import { classHash } from "./class";
import { Account } from "starknet";
import { timeout } from "./constants";

describe.skip("account upgrade and downgrade", () => {
  let env: string;
  let testAccounts: Account[];
  let targetAccounts: AccountConfig[];
  beforeAll(() => {
    env = "devnet";
    const conf = config(env);
    testAccounts = [testAccount(0, conf), testAccount(1, conf)];
    targetAccounts = [
      {
        classHash: classHash("SmartrAccount"),
        address: accountAddress("SmartrAccount", conf.accounts[0].publicKey),
        publicKey: conf.accounts[0].publicKey,
        privateKey: conf.accounts[0].privateKey,
      },
    ];
  });

  it(
    "deploys the SimpleAccount class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "SimpleAccount");
      expect(c.classHash).toEqual(classHash("SimpleAccount"));
    },
    timeout
  );

  it(
    "deploys the CoreValidator class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "CoreValidator");
      expect(c.classHash).toEqual(classHash("CoreValidator"));
    },
    timeout
  );

  it(
    "deploys the Account class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "SmartrAccount");
      expect(c.classHash).toEqual(classHash("SmartrAccount"));
    },
    timeout
  );

  it(
    "deploys the account contract with Account",
    async () => {
      const a = testAccounts[0];
      const c = await deployAccount(
        a,
        "SmartrAccount",
        targetAccounts[0].publicKey
      );
      expect(c).toEqual(targetAccounts[0].address);
    },
    timeout
  );

  it(
    "checks the account class hash",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Account(
        p,
        targetAccounts[0].address,
        conf.accounts[0].privateKey
      );
      const deployedClass = await a.getClassHashAt(a.address);
      expect(deployedClass).toEqual(targetAccounts[0].classHash);
    },
    timeout
  );

  it(
    "upgrades the account with SimpleAccount",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Account(
        p,
        targetAccounts[0].address,
        targetAccounts[0].privateKey
      );
      const txReceipt = await upgrade(a, classHash("SimpleAccount"));
      expect(txReceipt.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "checks the new account class hash",
    async () => {
      const a = testAccounts[0];
      const deployedClass = await a.getClassHashAt(targetAccounts[0].address);
      expect(deployedClass).toEqual(classHash("SimpleAccount"));
    },
    timeout
  );

  it(
    "downgrades the account back to Account",
    async () => {
      const conf = config(env);
      const p = provider(conf.providerURL);
      const a = new Account(
        p,
        targetAccounts[0].address,
        targetAccounts[0].privateKey
      );
      const txReceipt = await upgrade(a, classHash("SmartrAccount"));
      expect(txReceipt.isSuccess()).toEqual(true);
    },
    timeout
  );

  it(
    "checks the account class hash",
    async () => {
      const a = testAccounts[0];
      const deployedClass = await a.getClassHashAt(targetAccounts[0].address);
      expect(deployedClass).toEqual(classHash("SmartrAccount"));
    },
    timeout
  );
});
