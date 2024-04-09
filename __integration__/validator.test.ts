import { hash, ec, num } from "starknet";
import { authz_hash, defaultValidatorClassHash } from "./validator";
import { deployClass } from "./class";
import { timeout } from "./constants";
import { testAccount, config } from "./utils";
import { Account } from "starknet";

describe("sessionkey management", () => {
  let env: string;
  let testAccounts: Account[];
  beforeAll(() => {
    env = "devnet";
    const conf = config(env);
    testAccounts = [testAccount(0, conf), testAccount(1, conf)];
  });

  it(
    "deploys the DefaultValidator class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "DefaultValidator");
      expect(c.classHash).toEqual(
        `0x${defaultValidatorClassHash().toString(16)}`
      );
    },
    timeout
  );

  it("computes the hash with computeHashOnElements", async () => {
    let code = hash.computeHashOnElements(["0x1", "0x2", "0x3"]);
    // computeHashOnElements works this way:
    // - it start by hashing the first element with a 0x0 element
    // - then it hashes recursively the result with the next element
    // - it hashes the last element with the length of the array
    // as a result is is equivalent to h(h(h(h(0, 0x1), 0x2), 0x3), 3)
    let code2 = ec.starkCurve.pedersen(
      ec.starkCurve.pedersen(
        ec.starkCurve.pedersen(ec.starkCurve.pedersen("0x0", "0x1"), "0x2"),
        "0x3"
      ),
      "0x3"
    );
    expect(code).toBe(code2);
  });

  it("test BigInt", async () => {
    expect(num.toBigInt("0x1")).toBe(1n);
  });

  it("computes the hash of a string", async () => {
    let code = authz_hash("0x123", "0x234", "0x1", "0x2", "0x3", "0x4");
    expect(code).toBe(
      "0x4bf9baea6574851c9a8156450442e8db4de44284bba58ab79e634380e3fd294"
    );
  });
});
