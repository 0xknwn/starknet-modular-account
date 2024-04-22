import { Signer } from "starknet";

import {
  AccountModuleInterface,
  signatureToHexArray,
  Authorization,
  hash_auth_message,
} from "@0xknwn/starknet-account";

export const __module_validate__ =
  "0x119c88dea7ff05dbe71c36247fc6682116f6dafa24089373d49aca7b2657017";

export class SessionKeyGrantor extends Signer {
  validatorGrantorClass: string;
  constructor(validatorGrantorClass: string, privateKey: Uint8Array | string) {
    super(privateKey);
    this.validatorGrantorClass = validatorGrantorClass;
  }

  async sign(module: SessionKeyModule) {
    const request = await module.request(this.validatorGrantorClass);
    if (!request.hash) {
      throw new Error("hash not set");
    }
    const signature = await this.signRaw(request.hash);
    let sig = signatureToHexArray(signature);

    return sig;
  }
}

export class SessionKeyModule implements AccountModuleInterface {
  protected auth: Authorization;

  constructor(
    authKey: string,
    accountAddress: string,
    validatorClassHash: string,
    chainId: string = "0x1",
    expires: string = "0x0",
    root: string = "0x0"
  ) {
    this.auth = {
      accountAddress,
      validatorClass: validatorClassHash,
      selector: __module_validate__,
      authKey,
      expires,
      root,
      chainId,
      signature: [],
    };
  }

  async request(grantorClass: string) {
    if (this.auth.grantorClass && this.auth.grantorClass !== grantorClass) {
      throw new Error("reset grantor before requesting again");
    }
    this.auth.grantorClass = grantorClass;
    let hash = hash_auth_message(
      this.auth.accountAddress,
      this.auth.validatorClass,
      this.auth.grantorClass,
      this.auth.authKey,
      this.auth.expires,
      this.auth.root,
      this.auth.chainId
    );
    const auth: Authorization = {
      ...this.auth,
      hash: hash,
    };
    return auth;
  }

  async add_signature(signature: string[]) {
    if (!this.auth.signature) {
      this.auth.signature = [];
    }
    this.auth.signature?.push(...signature);
  }

  async reset(signature: string[]) {
    delete this.auth.grantorClass;
    if (!this.auth.signature) {
      this.auth.signature = [];
    }
  }

  prefix() {
    if (!this.auth.grantorClass) {
      throw new Error("grantor should be set before prefixing");
    }
    let calldata: string[] = [
      this.auth.validatorClass,
      this.auth.grantorClass,
      this.auth.authKey,
      this.auth.expires,
      this.auth.root,
    ];
    if (!this.auth.signature) {
      calldata = calldata.concat("0x0");
    } else {
      calldata = calldata.concat(
        `0x${this.auth.signature.length.toString(16)}`
      );
      calldata = calldata.concat(this.auth.signature);
    }
    calldata.unshift(`0x${calldata.length.toString(16)}`);
    return {
      entrypoint: "__module_validate__",
      contractAddress: this.auth.accountAddress,
      calldata,
    };
  }
}
