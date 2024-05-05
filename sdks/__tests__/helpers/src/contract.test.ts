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
        "0x69e764188a1dd42abc108888c1853913f078052c790c67f31b08a7a31a078e1"
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
        "0x573fed1a9584a6ca9d8248bbfd2c6267fa64677452a39821fb33551a4c5d9e7"
      );
    },
    default_timeout
  );
});
