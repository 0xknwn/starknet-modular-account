import { classHash } from "./class";
import { default_timeout } from "./parameters";
import { hash } from "starknet";
import { config } from "./utils";
import { data } from "./data.fixture";


const expected = {
  SimpleAccountClassHash: "0x1a3f5a334da41fc1eb5940c691f13df75a215967b0ce9b5a78c5cff4e847293",
  SimpleAccountAddress:  {
    "WEI": "0x4a3c9f794dfa1b6a63e344720e4806a04160237b8aa9771e6f76ae9326eca5f",
    "FRI": "0x660009647f265d0038500552d4563331c2aa25e96f9a69506032ba30c085e4d",
  } as { [id: string]: string; },}

describe.each(data)("contract management (helper)", ({fees, version, accountID}) => {
  let env: string = "devnet";

  it(
    `[${fees}] computes an account adddress`,
    async () => {
      const conf = config(env);
            
      const publicKey = conf.accounts[accountID].publicKey;
      const class_hash = classHash("SimpleAccount");
      expect(class_hash).toBe(
        expected.SimpleAccountClassHash
      );
      const constructorCallData = [
        publicKey,
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
        expected.SimpleAccountAddress[fees]
      );
    },
    default_timeout
  );
});
