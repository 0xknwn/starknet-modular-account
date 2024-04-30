import { declareClass, classHash } from "./class";
import { default_timeout } from "./parameters";
import { testAccounts, config } from "./utils";

describe("class management", () => {
  const env = "devnet";

  it(
    "deploys the Account class",
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[0];
      const output = await declareClass(account, "SimpleAccount");
      expect(output.classHash).toEqual(classHash("SimpleAccount"));
    },
    default_timeout
  );
});
