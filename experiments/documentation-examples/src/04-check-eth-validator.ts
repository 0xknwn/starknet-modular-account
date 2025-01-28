// file src/04-check-eth-validator.ts
import {
  classHash,
  classNames as moduleClassNames,
} from "@0xknwn/starknet-module";

console.log(
  "Computed EthValidator class hash:",
  classHash(moduleClassNames.EthValidator)
);
