# Using Modules

Starknet Modular Account requires modules to work properly:

- Validator Module, including the Core Validator Module are used to validate
  the transaction
- Executor Module are not yet available. They should enable some changes in the
  account behavior: you can create metadata to track the signer complies to
  some specific rules; you can add checks that are not related to the signature
  like the fact that an amount allowed to a signer is not already spent.

This section details module. In particular, it shows:

- How to [develop your own Validator Module](./DEVELOPING-MODULES.md)
- How the [Stark Validator Module](./STARK-VALIDATOR.md) Works
- How the [SessionKey Validator Module](./SESSIONKEY-VALIDATOR.md) Works
