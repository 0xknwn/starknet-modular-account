// file src/01-check-class.ts
import { classHash, classNames } from "@0xknwn/starknet-modular-account";

console.log("smartrAccount class hash:", classHash(classNames.SmartrAccount));
console.log("starkValidator class hash:", classHash(classNames.StarkValidator));
