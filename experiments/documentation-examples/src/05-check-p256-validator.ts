// file src/05-check-p256-validator.ts
import {
  classHash,
  classNames as moduleClassNames,
} from "@0xknwn/starknet-module";

console.log(
  "Computed P256Validator class hash:",
  classHash(moduleClassNames.P256Validator)
);
