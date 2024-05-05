import { classHash } from "./class";
import { default_timeout } from "./parameters";
import { hash } from "starknet";

describe("contract management (helper)", () => {
  let env: string = "devnet";

  it(
    "computes an account adddress",
    async () => {
      const publicKey =
        "0x39d9e6ce352ad4530a0ef5d5a18fd3303c3606a7fa6ac5b620020ad681cc33b";
      let class_hash = classHash("SimpleAccount");
      expect(class_hash).toBe(
        "0x53b91f19a9fde9cbef897670da17208b6ce60d8dd4cf301c1f45a976fd6c18f"
      );
      const constructorCallData = [
        "0x39d9e6ce352ad4530a0ef5d5a18fd3303c3606a7fa6ac5b620020ad681cc33b",
        "0x10",
      ];
      // compute the account address
      const account_address = hash.calculateContractAddressFromHash(
        publicKey,
        class_hash,
        constructorCallData,
        0
      );
      expect(account_address).toBe(
        "0x14f21b3280bec35cf2ef678eef63cbb59f46ba0d00034a07716ca00a6a0fa8d"
      );
    },
    default_timeout
  );
});
