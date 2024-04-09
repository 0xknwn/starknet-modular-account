import { shortString, hash } from "starknet";

// defaultValidatorClassHash returns the class hash of the DefaultValidator class.
// changing the contract requires to update the cairo account contract default
// sudo validator.
export const defaultValidatorClassHash = (env: string = "devnet") =>
  BigInt("0xfdd96f58c6219f382af97e603eff1bdc4c447e60494acfabce064a0cb0b639");

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
