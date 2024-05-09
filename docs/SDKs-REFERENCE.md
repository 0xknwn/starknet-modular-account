# SDK Reference Documentation

This section provides the generated reference documentation for the
Typescript/Javascript SDKs that comes with the project. For a better
understanding of those SDKs, check the [Using SDKs](./SDKs.md) section.

The 3 SDKs can be downloaded from
[npmjs.com](https://www.npmjs.com/package/@0xknwn/starknet-modular-account). 

- [@0xknwn/starknet-modular-account](https://www.npmjs.com/package/@0xknwn/starknet-modular-account)
  extends the starknet.js `Account` to support multiple signers and manage
  modules. It also provides the `AccountModuleInterface` that should be used by
  module SDKs. You can check the reference documentation for this SDK
  [here](./starknet-account/modules.md)
- [@0xknwn/starknet-module-sessionkey](https://www.npmjs.com/package/@0xknwn/starknet-module-sessionkey)
  provides the `SessionKeyModule` that implements the `AccountModuleInterface`
  as well as tools to configure the sessionkey module, including the
  `PolicyManager` and the `PolicyGrantor` classes. You can check the reference documentation for this SDK
  [here](./starknet-module-sessionkey/modules.md)
- [@0xknwn/starknet-module](https://www.npmjs.com/package/@0xknwn/starknet-module)
  provides the `EthModule` that implements the `AccountModuleInterface`. To sign
  transaction, you can simply use the Starknet.js `EthSigner`. You can check the
  reference documentation for this SDK
  [here](./starknet-module/modules.md)


In addition, the project provides another SDK called
[@0xknwn/starknet-test-helpers](https://www.npmjs.com/package/@0xknwn/starknet-test-helpers) that can be used to create helper classes outside of
this repository. That project is used to help building demonstration and/or
tests. In particular in includes the tools to 2 contracts named `Counter` 
and `SwapRouter`. You can check the reference documentation for this SDK
[here](./tests-starknet-helpers/modules.md).
