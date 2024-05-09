import { Call } from "starknet";

import { AccountModuleInterface } from "@0xknwn/starknet-modular-account";
import { classHash } from "./class";

export class P256Module implements AccountModuleInterface {
  protected accountAddress: string;
  constructor(accountAddress: string) {
    this.accountAddress = accountAddress;
  }

  prefix(calls: Call[] | Call) {
    let calldata: string[] = [classHash("P256Validator")];
    calldata.unshift(`0x${calldata.length.toString(16)}`);
    return {
      entrypoint: "__module_validate__",
      contractAddress: this.accountAddress,
      calldata,
    };
  }
}
