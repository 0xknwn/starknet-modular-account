# Using SDKs

**starknet-modular-account** comes with 2 SDKs that leverage
[starknet.js](https://github.com/starknet-io/starknet.js).

- [@0xknwn/starknet-modular-account](https://www.npmjs.com/package/@0xknwn/starknet-modular-account)
  provides the SmartrAccount class that extends starknet.js account to support
  multiple signers and helps to manage modules. It also provides the
  AccountModuleInterface that should be used by module SDKs.
- [@0xknwn/starknet-module-sessionkey](https://www.npmjs.com/package/@0xknwn/starknet-module-sessionkey)
  provides the SessionKeyModule that implements the AccountModuleInterface and
  provides the tools to configure the sessionkey module.

> This section provides a set of tutorials about how to use the account and
> modules .
