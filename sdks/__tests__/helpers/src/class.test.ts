import { declareClass, classHash, classNames } from "./class";
import { default_timeout } from "./parameters";
import { testAccounts, config } from "./utils";
import { data } from "./data.fixture";

describe.each([data[1]])("class management", ({ fees, version, accountID }) => {
  const env = "devnet";

  it(
    `[${fees}] deploys the Account class`,
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[accountID];
      const output = await declareClass(account, classNames.SimpleAccount, {
        version: version.declare,
      });
      expect(output.classHash).toEqual(classHash(classNames.SimpleAccount));
    },
    default_timeout
  );
});
