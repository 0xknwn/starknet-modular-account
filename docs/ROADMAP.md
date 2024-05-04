# Roadmap and Known Issues

The starknet modular account is a work-in-progress effort to provide features
to dapps and provide better experience to Starknet. As such, there is a lot
to work on and this section gives some ideas of the direction the project will
take the coming weeks and months.

## Roadmap

Ideas to enhance the account are legions. However, we plan to stay focus on a
small set of features:

1. Develop additional validator modules. This includes both core validators and
   regular validators. The goal is to identify lack of support for some
   scenarios by the account. It is also to provide more value for the modular
   account like the ability to better support mobile devices
2. Move the Validator Module data from a prefix call to the account signature.
   This might not be feasible but it makes sense because the validation is
   supposed to rely on the signature.
3. Add support for Executor Modules. Some scenario like the ability to delay the
   execution of a transaction or the ability to track some data like an amount
   of ERC20 dedicated to a 3rd party requires those modules to work.
4. Add support for the version 3 of the transaction as described in
   [SNIP-8](https://github.com/starknet-io/SNIPs/blob/main/SNIPS/snip-8.md).
5. Ensure the compatibility between session key and
   [SNIP-12](https://github.com/starknet-io/SNIPs/blob/main/SNIPS/snip-12.md).
6. Make sure the account can upgrade the OpenZeppelin, Argent and Braavo Account

If you need support for another scenario, feel free to open an issue on Github.

## Known Issues

In addition to the planned changes above, there are a number of smaller issues
that have been identified and need to be addressed. Most of them are
implementation details bit some of them might impact your usage. Those issues
are the following:

- is_valid_signature should support `Array<felt252>` and not `felt252` as a
  first parameter for the account and the module
- Version the contracts for both accounts and modules and maintain a
  compatibility matrix
- If possible, rely on Openzeppelin `calculate_contract_address` functions
  that come from `src/utils/deployments.cairo` rather than implementing them in
  the project
- Improve the distinction between stark validator and core validator
- Make sure we cannot remove the core module from modules with the
  `remove_module` entrypoint
- Improve the upgrade management with the help of the bootstrap experiment.
  Right now the upgrade works because it is actually a downgrade and move back.
  In reality it will not pass a test of an upgrade with an Argent, Braavos or
  Openzeppelin Account.
- Right now, type conversions are done manually with the `core::traits::Into`
  package. Improve it so that is it more readable and consistent with how other
  libraries like openzeppelin does.
- Block the deployment of the module classes by adding an `assert(false)` with
  a message in the `constructor`
- Reduce, as much as possible the SDKs API surface to make it simpler to use
  for developers.
- Associate class versions with class hash in the documentation and version
  the documentation so that we can keep track of the version history
- It is possible to get a sessionkey that has all accesses on an account. We
  need to disable that feature to force dapps to requests what they want and
  for users to review policies.
- For a better understanding of the sessionkey flow in the SDK we should sign
  directly the request and not the `SessionKeyModule`
- We should remove the `is_valid_signature` method from `IValidator` interface
  and move it to the `ICoreValidator` interface to prevent errors.
