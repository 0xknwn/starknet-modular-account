import { shortString, hash } from "starknet";

export const STARKNET_DOMAIN_TYPE_HASH = `0x${559829204566802802769333095934997962208934200349121683389685917736841749624n.toString(16)}`;
export const SESSION_TYPE_HASH = `0x${300158337552274304490739948149127820835543586625599349706216852674177038348n.toString(16)}`;
export const POLICY_TYPE_HASH = `0x${1328685774472303838129974879115470406966524039382350505658868861646452794728n.toString(16)}`;

export const hash_auth_message = (
  account_address: string,
  validator_class: string,
  grantor_class: string,
  auth_key: string,
  expires: string,
  root: string,
  chain_id: string
): string => {
  const key = hash.computeHashOnElements([
    SESSION_TYPE_HASH,
    auth_key,
    expires,
    root,
  ]);
  const chain = hash.computeHashOnElements([
    STARKNET_DOMAIN_TYPE_HASH,
    chain_id,
  ]);
  return hash.computeHashOnElements([
    shortString.encodeShortString("StarkNet Message"),
    account_address,
    validator_class,
    grantor_class,
    key,
    chain,
  ]);
};
