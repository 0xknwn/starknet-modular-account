import { Signer } from "starknet";
import type { Call } from "starknet";

export class SessionKey extends Signer {
  public contractAddress: string;
  public classHash: string;
  constructor(
    pk: Uint8Array | string,
    contractAddress: string,
    classHash: string
  ) {
    super(pk);
    this.contractAddress = contractAddress;
    this.classHash = classHash;
  }

  public prefix(): Call {
    return {
      contractAddress: this.contractAddress,
      entrypoint: "__module__validate__",
      calldata: [this.classHash],
    };
  }
}
