# Using SDKs

**starknet-modular-account** comes with 2 SDKs that leverage
[starknet.js](https://github.com/starknet-io/starknet.js).

- [@0xknwn/starknet-modular-account](https://www.npmjs.com/package/@0xknwn/starknet-modular-account)
  provides the SmartrAccount class that extends starknet.js account to support
  multiple signers and helps to manage modules. It also provides the
  AccountModuleInterface that should be used by module SDKs.
- [@0xknwn/starknet-module-sessionkey](https://www.npmjs.com/package/@0xknwn/starknet-module-sessionkey)
  provides the `SessionKeyModule` that implements the `AccountModuleInterface`
  as well as tools to configure the sessionkey module, including the
  `PolicyManager` and the `PolicyGrantor` classes.

In addition, the project provides another SDK called
[@0xknwn/starknet-test-helpers](https://www.npmjs.com/package/@0xknwn/starknet-test-helpers) that can be used to create helper classes outside of
this repository. It is used to demonstrate the 2 main SDKs.

This section provides a set of tutorials about how to use the account and
modules. If you want to understand how modules are working internally, you
should check [Modules Internals](./MODULES.md).

