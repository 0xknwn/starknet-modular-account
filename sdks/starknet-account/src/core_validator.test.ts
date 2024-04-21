import {
  declareClass,
  default_timeout,
  testAccounts,
  config,
} from "starknet-test-helpers";

import { Account } from "starknet";

const coreValidatorClassHash =
  "0x2739b5ddf22645e638a811b0c9c0c11a59e82b2b0739f2dfaf82cefc67349ab";

describe("coreValidator management", () => {
  let env: string;
  beforeAll(() => {
    env = "devnet";
  });

  it(
    "deploys the coreValidator class",
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareClass(a, "CoreValidator");
      expect(c.classHash).toEqual(coreValidatorClassHash);
    },
    default_timeout
  );
});
