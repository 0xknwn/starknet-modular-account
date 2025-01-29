// file src/03-check-class.ts
import {
  classHash,
  classNames as moduleClassNames,
} from "@0xknwn/starknet-module";

console.log(
  "MultisigValidator class hash:",
  classHash(moduleClassNames.MultisigValidator)
);
