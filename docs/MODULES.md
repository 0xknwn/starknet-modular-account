# Modules

Starknet Modular Account requires modules to work properly. There are 2 types of
modules:

- Validator Modules, including the Core Validator Module are used to validate
  transactions
- Executor Modules are not yet available. They enable to change the account
  behavior: you can create metadata to track the signer complies to
  some specific rules; you can add checks that are not related to the signature
  like the fact that an amount allowed to a signer is not already spent.

This section details module development and specific implementations. In
particular, the folllowing are explained.

- How to [Developing your Own Validator Module](./MODULES-DEVELOPMENT.md)
- How the [Stark Validator Module](./MODULE-STARK-VALIDATOR.md) Works
- How the [Eth Validator Module](./MODULE-ETH-VALIDATOR.md) Works
- How the [SessionKey Validator Module](./MODULE-SESSIONKEY-VALIDATOR.md) Works

If you just plan to use the Starknet Modular Account with those modules, we
suggest you check the [SDKs](./SDKs.md) sections of the documentation.
