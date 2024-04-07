import { deployClass } from "./class";
import { classHash } from "./utils";
import { timeout } from "./constants";

describe("class management", () => {
  let env: string;
  beforeAll(() => {
    env = "devnet";
  });

  it(
    "deploys the Account class",
    async () => {
      const c = await deployClass("SimpleAccount");
      expect(c.classHash).toEqual(classHash("SimpleAccount"));
    },
    timeout
  );
});
