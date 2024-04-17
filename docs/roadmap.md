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

Validators are to be improved in a number of ways, In particular:

- check if we can move the validator decorator away from the call prefix
  into the signature
- make sure they are properly tested on sepolia and on the mainnet
- jail the sudo validator so that it can only be limited to account management
  tasks, including enabling/disabling the gardian

In addition there are a list feature that could be implemented as module
validators.

### Multisig

Multisig Validators should be used both as a sudo and as a standard validator.
For now what we plan is a "all addresses are even" validator with a threshold.
It is working with the stark signature. What is plan is:
- Have validators that support P256 (secp256r1) to support passkeys and and
  ECDSA (secp256k1) to support ETH validators. We can assume that the hash have
  to also evolve in order to simplify the usage with the wallets.
- Force the use of a guardian validator in order to allow unlocking an account
  if, for instance, number of steps for \_\_validate\_\_ is too high and the
  account cannot be used (or could it be the core validator)

### Guardians

Guardian can be requested to execute a limited number of things like:
- Helping for the recovery via a KYC process
- Managing the dead switch in case an event makes us think there is an issue
  with those wallets
- Prevent position liquidation if the market crashes


## Session Key

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
- Limit the number of executions or the amount of ERC20 managed by a sessionkey
  by adding some sort of a tracker in a contract.
- check if we can group multiple-execution with one session-key per execution in
  a single transaction.

### Transaction Grant

The Transaction Grant validator is a interesting concept to push forward,
including to reduce cost and group calls to avoid the `nonce` and ordering
issue. For now on, this is a proof of concept only and remain to be worked:

- this validator enables to sign a transaction without the nonce, so that it can
  be executed several times, assuming the validator is enabled on the account.
- an addition to it consists in limiting the number of executions associated 
  with it so that the transaction can be executed, N-times only. To address that
  we would generate the nonce from the transaction hash and add a counter inside
  the contract
- N-of-M; as an evolution of this validator, we would define M transaction and
  generate a Merkle tree of them, passing the root to the validator with the
  TX Grant proof. We would track the number of execution, allowing to run N of
  M transactions. A use case is to allow a 3rd party to swap on an account but
  force it to only do it once letting him choose between several protocols.
- Add a condition to trigger the event like, for instance, the result of an
  Oracle, a VRF or the result of a vote.

> Note: For security reasons, we would strongly encourage to use an `expires`
> attribute and to rely on a separate service to keep track of those "granted"

### Others

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

## Signers

- ERC-165 signers generated a message you sign with your real signer. The
  message format should be compliant with ERC-165 and interpreted by the
  signer that could present it correctly on your phone

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
