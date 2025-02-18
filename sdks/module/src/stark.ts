import { Call } from "starknet";

import { AccountModuleInterface } from "@0xknwn/starknet-modular-account";
import { classHash, classNames } from "@0xknwn/starknet-contracts";

export class StarkModule implements AccountModuleInterface {
  protected accountAddress: string;
  constructor(accountAddress: string) {
    this.accountAddress = accountAddress;
  }

  prefix(calls: Call[] | Call) {
    let calldata: string[] = [classHash(classNames.StarkValidator)];
    calldata.unshift(`0x${calldata.length.toString(16)}`);
    return {
      entrypoint: "__module_validate__",
      contractAddress: this.accountAddress,
      calldata,
    };
  }
}
