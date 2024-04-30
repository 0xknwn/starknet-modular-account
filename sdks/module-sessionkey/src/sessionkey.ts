import { Signer, Call } from "starknet";

import {
  AccountModuleInterface,
  signatureToHexArray,
  Authorization,
  hash_auth_message,
} from "@0xknwn/starknet-modular-account";
import { PolicyManager } from "./policies";

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
  protected policyManager?: PolicyManager;

  constructor(
    authKey: string,
    accountAddress: string,
    validatorClassHash: string,
    chainId: string,
    expires: string,
    policyManager?: PolicyManager
  ) {
    let root = "0x0";
    if (policyManager) {
      root = policyManager.getRoot();
      this.policyManager = policyManager;
    }
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

  async get_session_key() {
    if (!this.auth.grantorClass) {
      throw new Error("grantor should be set before requesting session key");
    }
    return hash_auth_message(
      this.auth.accountAddress,
      this.auth.validatorClass,
      this.auth.grantorClass,
      this.auth.authKey,
      this.auth.expires,
      this.auth.root,
      this.auth.chainId
    );
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

  prefix(calls: Call[] | Call) {
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
    if (this.auth.root !== "0x0") {
      if (!Array.isArray(calls)) {
        calls = [calls];
      }
      let proof_number = 0;
      for (let call of calls) {
        let contractAddress = call.contractAddress;
        let selector = call.entrypoint;
        const proof = this.policyManager?.getProof({
          contractAddress,
          selector,
        });
        if (proof_number === 0) {
          if (!proof) {
            calldata = calldata.concat(`0x0`);
          } else {
            calldata = calldata.concat(`0x${proof.length.toString(16)}`);
          }
        }
        if (proof) {
          calldata = calldata.concat(...proof);
        }
      }
    }
    calldata.unshift(`0x${calldata.length.toString(16)}`);
    return {
      entrypoint: "__module_validate__",
      contractAddress: this.auth.accountAddress,
      calldata,
    };
  }
}
