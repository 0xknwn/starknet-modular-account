import { deployClass } from "./class";
import { timeout } from "./constants";
import { testAccount, config } from "./utils";
import { Account } from "starknet";

const coreValidatorClassHash =
  "0x2739b5ddf22645e638a811b0c9c0c11a59e82b2b0739f2dfaf82cefc67349ab";

describe("coreValidator management", () => {
  let env: string;
  let testAccounts: Account[];
  beforeAll(() => {
    env = "devnet";
    const conf = config(env);
    testAccounts = [testAccount(0, conf), testAccount(1, conf)];
  });

  it(
    "deploys the coreValidator class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "CoreValidator");
      expect(c.classHash).toEqual(coreValidatorClassHash);
    },
    timeout
  );
});
