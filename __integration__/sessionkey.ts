import { ec, shortString } from "starknet";

export const signature_hash = (
  account: string,
  session_key: string,
  expires: string,
  merkle_root: string,
  chain_id: string
): string => {
  const key = ec.starkCurve.pedersen(
    ec.starkCurve.pedersen(session_key, expires),
    merkle_root
  );
  return ec.starkCurve.pedersen(
    ec.starkCurve.pedersen(
      ec.starkCurve.pedersen(
        shortString.encodeShortString("StarkNet Message"),
        account
      ),
      key
    ),
    chain_id
  );
};
