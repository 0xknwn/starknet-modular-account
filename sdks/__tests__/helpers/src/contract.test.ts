import { classHash, classNames } from "@0xknwn/starknet-contracts";
import { default_timeout } from "./parameters";
import { hash } from "starknet";
import { config } from "./utils";
import { data } from "./data.fixture";

const expected = {
  SimpleAccountClassHash:
    "0x03b71253f02ac9f81b93d2aa1beeae16ed3a035f57ea7ad0a3cacb8804a09a25",
  SimpleAccountAddress: {
    FRI: "0x65fb0afa7fda630ac1f2b5d035a6856b739f25f8c87fd144810b183a938cfe4",
  } as { [id: string]: string },
};

describe.each(data)(
  "contract management (helper)",
  ({ fees, version, accountID }) => {
    let env: string = "devnet";

    it(
      `[${fees}] computes an account address`,
      async () => {
        const conf = config(env);

        const publicKey = conf.accounts[accountID].publicKey;
        const class_hash = classHash(classNames.SimpleAccount);
        expect(class_hash).toBe(expected.SimpleAccountClassHash);
        const constructorCallData = [publicKey, "0x10"];
        // compute the account address
        const account_address = hash.calculateContractAddressFromHash(
          publicKey,
          class_hash,
          constructorCallData,
          0
        );
        expect(account_address).toBe(expected.SimpleAccountAddress[fees]);
      },
      default_timeout
    );
  }
);
