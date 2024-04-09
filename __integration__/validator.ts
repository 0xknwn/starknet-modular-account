import { shortString, hash } from "starknet";

// simpleValidatorClassHash returns the class hash of the SimpleValidator class.
// changing the contract requires to update the cairo account contract default
// sudo validator.
export const simpleValidatorClassHash = (env: string = "devnet") =>
  BigInt("0x12dda6e5be1370b9488489e62076e2053abdf1b096a866227dd724c5d6cd201");

export const authz_hash = (
  account_address: string,
  account_class: string,
  authz_key: string,
  expires: string,
  merkle_root: string,
  chain_id: string
): string => {
  const key = hash.computeHashOnElements([authz_key, expires, merkle_root]);
  return hash.computeHashOnElements([
    shortString.encodeShortString("StarkNet Message"),
    account_address,
    account_class,
    key,
    chain_id,
  ]);
};
