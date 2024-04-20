import { deployClass, classHash } from "./class";
import { timeout } from "./constants";
import { testAccount, config } from "./utils";
import { Account } from "starknet";

describe.skip("class management", () => {
  let env: string;
  let testAccounts: Account[];
  beforeAll(() => {
    env = "devnet";
    const conf = config(env);
    testAccounts = [testAccount(0, conf), testAccount(1, conf)];
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
});
