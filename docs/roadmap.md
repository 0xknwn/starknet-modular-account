# Roadmap

There are a number of features that we could develop in order to make the smartr
account valuable to everyone. Below are some ideas that could be used as a
roadmap. We do **NOT** commit on those features, neither on any sort of
timeline.

## Documentation

The project should have a number of documentation:

- Whitepapers about the account internals
- Reference documents for the components and helpers
- How-to guides and examples to develop modules
- How-to guides and examples to develop SDKs and/or Dapps
- Try to figure-out a solution so that the documentation is managed in the
  project.

## Validators

Validators are to be improved in a number of ways

- jail the core validator so that it can only be limited to account management
  tasks
- remove the current hardcoding of the core validator and make sure it can be
  updated, even if it requires the validator keys to be regenerated. This could
  be part of the services an infrastructure would offer
- check the sessionkey so that:
  - it can support a multiple signatures core validator
  - it can itself be a multi-signature
  - it supports the `expires` parameter
  - it supports other signature schemes to work with passkeys
  - it supports policies with the merkle root and proofs
  - it requires a list of calls/parameters to be applied
- figure-out a way to limit the number of executions of a sessionkey (incl.
  1-only)
- check if we can group multiple-execution with one session-key per execution in
  a single transaction.
- check if we can move the validator decorator away from the call prefix and
  into the signature
- make sure they are properly tested sepolia and mainnet
- develop validators with support for passkeys (secp256r1) and eth (secp256k1)
- force the use of a guardian validator in order to allow unlocking an account
  if, for instance, number of steps for \_\_validate\_\_ is too high and the
  account cannot be used (or could it be the core validator)
- develop a yasager validator with merkle root and ordered transactions. It
  could be that the first call is actually a nonce  stored in a separate
  contract this way we would limit the execution to one and only one time.

## Executors

Scenarios of executors are yet to be better defined. However, there is a number
of solutions that can be provided with this system, including:

- agree now to execute later (store with a hash and key and emit an event), 
  except if some blocage is performed. Allow to run later transaction with a
  model with an incentive for triggering bots
- onchain multi-signature

## Dapps and SDKs

- an application that can be used to manage your account. It could also manage
  reminders so that people renew authorizations
- a chrome/firefox signer that would allow a multisig coordination to manage
  the account
- a stop/loss application that relies on the session key managed by a bot
- integrate the account/signer with starknetkit

## Registry and "reviewed" Modules

provide a validation process for a modular model. Check if we can rely on
manager/registry/interfaces like Safe does or on something like
[eip-7484](https://eips.ethereum.org/EIPS/eip-7484).

## Other considerations

- create a test account that succeeds the estimate_fee and the \_\_validate\_\_ 
  but fails the \_\_execute\_\_ to understand how failed transactions are
  charged. It should be easy: (a) run okay without a signature and (b) fail in
  the execution where there is a signature.
- monitor the number of steps used in various \_\_validate\_\_ scenarios
- present the project to starkware and/or be involved with hackathons
- check the zerodev.app business model to provide something similar
- build a community to support the project and get help on the project
