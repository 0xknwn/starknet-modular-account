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
        const class_hash = classHash("SimpleAccount");
      expect(class_hash).toBe(
        "0x1a3f5a334da41fc1eb5940c691f13df75a215967b0ce9b5a78c5cff4e847293"
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
        "0x4a3c9f794dfa1b6a63e344720e4806a04160237b8aa9771e6f76ae9326eca5f"
      );
    },
    default_timeout
  );
});
