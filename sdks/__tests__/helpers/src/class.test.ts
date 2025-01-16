import { declareClass, classHash } from "./class";
import { default_timeout } from "./parameters";
import { testAccounts, config } from "./utils";
import { data } from "./data.fixture";

describe.each(data)("class management", ({name, version, accountID}) => {
  const env = "devnet";

  it(
    `[${name}] deploys the Account class`,
    async () => {
      if (name === "WEI") {
        return;
      }
      const conf = config(env);
      const account = testAccounts(conf)[accountID];
      const output = await declareClass(account, "SimpleAccount", {version: version.declare});
      expect(output.classHash).toEqual(classHash("SimpleAccount"));
    },
    default_timeout
  );
});
