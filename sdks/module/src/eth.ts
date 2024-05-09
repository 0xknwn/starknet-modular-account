import { Call } from "starknet";

import { AccountModuleInterface } from "@0xknwn/starknet-modular-account";
import { classHash } from "./class";

export const __module_validate__ =
  "0x119c88dea7ff05dbe71c36247fc6682116f6dafa24089373d49aca7b2657017";

export class EthModule implements AccountModuleInterface {
  protected accountAddress: string;
  constructor(accountAddress: string) {
    this.accountAddress = accountAddress;
  }

  prefix(calls: Call[] | Call) {
    let calldata: string[] = [classHash("EthValidator")];
    calldata.unshift(`0x${calldata.length.toString(16)}`);
    return {
      entrypoint: "__module_validate__",
      contractAddress: this.accountAddress,
      calldata,
    };
  }
}
