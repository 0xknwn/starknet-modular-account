import { hash, ec, num } from "starknet";
import { coreValidatorClassHash } from "./core_validator";
import { hash_auth_message } from "./message";
import { deployClass } from "./class";
import { timeout } from "./constants";
import { testAccount, config } from "./utils";
import { Account } from "starknet";

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
      expect(c.classHash).toEqual(`0x${coreValidatorClassHash().toString(16)}`);
    },
    timeout
  );
});
