// file src/02-check-class.ts
import { classHash, classNames } from "@0xknwn/starknet-modular-account";

console.log("starkValidator class hash:", classHash(classNames.StarkValidator));
