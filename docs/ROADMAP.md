# Roadmap and Known Issues

The starknet modular account is a work-in-progress effort to provide features
to dapps and provide better experience to Starknet. As such, there is a lot
to work on and this section gives some ideas of the direction the project will
take the coming weeks and months.

## Roadmap

Ideas to enhance the account are legions. However, we plan to stay focus on a
small set of features:

1. Develop a Guarded Validator. This would require it to be a core validators.
   It would provide more value for the modular account because the
   implementation requires some different signature depending on the calls so
   it would validate/invalidate the current set of interfaces.
2. Add an entrypoint to allow `execute_from_outside` with the signature from
   the core validator and some limitation. This entrypoint would require to
   manage a user defined Nonce to prevent replay-scenarios. It would also
   battle test the model. The benefit from that entrypoint besides is that it
   allows a 3rd party to pay for your transaction. A consolation prize for the
   paymaster to not be implemented yet.
3. Move the Validator Module data from a prefix call to the account signature.
   This might not be feasible but it makes sense because the validation is
   supposed to rely on the signature.
4. Add support for Executor Modules. Some scenario like the ability to delay the
   execution of a transaction or the ability to track some data like an amount
   of ERC20 dedicated to a 3rd party requires those modules to work.
5. Add support for the version 3 of the transaction as described in
   [SNIP-8](https://github.com/starknet-io/SNIPs/blob/main/SNIPS/snip-8.md).
6. Ensure the compatibility between session key and
   [SNIP-12](https://github.com/starknet-io/SNIPs/blob/main/SNIPS/snip-12.md).
7. Check what can be done to support upgrades from OpenZeppelin, Argent and
   Braavo Accounts

If you need support for another scenario, feel free to open an issue on Github.

## Known Issues

In addition to the planned changes above, there are a number of smaller issues
that have been identified and need to be addressed. Most of them are
implementation details bit some of them might impact your usage. Those issues
are the following:

- Version the contracts for both accounts and modules and maintain a
  compatibility matrix. Actually we should check if we can rely on the
  boostrap experiment to have a more stable account address stability and
  introduce a contract that manages versions and allow to initiate some sort
  of registry.
- Improve the upgrade management with the help of the bootstrap experiment.
  Right now the upgrade works because it is actually a downgrade and move back.
  In reality it will not pass a test of an upgrade with an Argent, Braavos or
  Openzeppelin Account.
- Right now, type conversions are done manually with the `core::traits::Into`
  package. Improve it so that is it more readable and consistent with how other
  libraries like openzeppelin does.
- Reduce, as much as possible the SDKs API surface to make it simpler to use
  for developers.
- Associate class versions with class hash in the documentation and version
  the documentation so that we can keep track of the version history
- It is possible to get a sessionkey that has all accesses on an account. We
  need to disable that feature to force dapps to requests what they want and
  for users to review policies.
- For a better understanding of the sessionkey flow in the SDK we should sign
  directly the request and not the `SessionKeyModule`
- Check when OpenZeppelin uses Poseidon Hash and see if that impacts the Eth
  module.
- Fees are not computed correctly when a large part comes from the signature and
  as a result, the deploy_account has a fixed maxFee. Improve the computation
  and remove that fix value.