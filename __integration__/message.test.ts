import { hash, ec, num } from "starknet";
import { hash_auth_message } from "./message";
import { testAccount, config } from "./utils";
import { Account } from "starknet";

describe("message management", () => {
  let env: string;
  let testAccounts: Account[];
  beforeAll(() => {
    env = "devnet";
    const conf = config(env);
    testAccounts = [testAccount(0, conf), testAccount(1, conf)];
  });

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

  it("computes the hash with hash_auth_message", async () => {
    let code = hash_auth_message("0x123", "0x234", "0x1", "0x2", "0x3", "0x4");
    expect(code).toBe(
      `0x${num.toBigInt(2082333857348120007286744785825472038669092855486256517073272066416227387528n).toString(16)}`
    );
  });
});
