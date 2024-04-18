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
- remove the current hardcoding of the core validator and make sure it can be
  updated, even if it requires the validator keys to be regenerated. This could
  be part of the services an infrastructure would offer

In addition there are a list feature that could be implemented as module
validators.

### Multisig Validators

Multisig Validators should be used both as a sudo and as a standard validator.
For now what we plan is a "all addresses are even" validator with a threshold.
It is working with the stark signature. What is plan is:
- Have validators that support P256 (secp256r1) to support passkeys and and
  ECDSA (secp256k1) to support ETH validators. We can assume that the hash have
  to also evolve in order to simplify the usage with the wallets.
- Force the use of a guardian validator in order to allow unlocking an account
  if, for instance, number of steps for \_\_validate\_\_ is too high and the
  account cannot be used (or could it be the core validator)

### Guardian Validator

Guardian can be requested to execute a limited number of things like:
- Helping for the recovery via a KYC process
- Managing the dead switch in case an event makes us think there is an issue
  with those wallets
- Prevent position liquidation if the market crashes


### Session Key Validator

This would allow to provide access to a signer and not only a transaction see
is as a "sign the signer not the transaction". In this scenario, the grant can
be done (1) Offchain with (2) the merkle tree root of a set ACL or a set of
Nonce (i.e. Nonce Maps that can be filled) and (3) limits (e.g. Timed-Based or
Allowance). Those keys can then git given to a video game for autosigning
transactions or to a bot to execute a stop-loss order.

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

### Passkeys/WebAuthn:

secp256r1, with a **R** is the signature validated by the NIST and the basis for
a number of protocols including TLS, DNSSEC, Apple's Secure Enclave, Passkeys,
Android Keystore or Yubikey. Starknet supports with v0.12.3 secp256r1 as part of
[Starknet OS](https://community.starknet.io/t/starknet-next-versions-v0-12-3-v0-13-0-and-sepolia-testnet-migration/106529)

 That is for sure something
that can easily be reproduced for other use cases with the help of the
[WebAuthn Chrome Web Developer Codelabs](https://developers.google.com/codelabs/webauthn-reauth)

### Transaction Grant Validator

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

### Other Validators

There are a number of validators to consider, including:

- develop a yasager validator with merkle root and ordered transactions. It
  could be that the first call is actually a nonce  stored in a separate
  contract this way we would limit the execution to one and only one time.


You should also check hackathons and ideas popping around include:

- The Ability to activate a module Offchain from a session key, see
  [Why we are building Kernel on ERC-7579](https://docs.zerodev.app/blog/why-7579-over-6900)
  in the Zerodev.app.
- The use of ZK Verifier to only use if something is proven. I'm wondering if
  it could help with Privacy to avoid showing-up addresses or more simply
  building some kind of mixer.
- The use of other verification techniques like the [time/place of a photo](https://www.tdcommons.org/cgi/viewcontent.cgi?article=5433&context=dpubs_series)
  as well as the result of an AI-classification of the photo.
- The ability to integrate Offchain Service to access the account. They could be
  centralize with the addition of a limited access to the account via a key.
  They could also be part of a composition, i.e. they could co-sign or sign a
  certain set of arguments in the call. They could have been granted some sort
  of pre-agreement onchain (via an ID) or even offchain with a sessionkey. A
  good example is that an external service chooses the address of the swap
  protocol to use to optimize fees
- The ability to use the same transaction on several chain for a global
  transaction. This requires relying on an Internal Nonce and filtering the call
  based on the chainid. A close scenario consists in signing the L2 transaction
  with a L1 wallet.
- Basing realworld operation on a wallet transaction. Not sure if it makes sense
  right scenario and what the challenge but a hackathon project has opened a
  house door base on the fact people can run a Tx on a Safe
- The addition of some specific requirements, like the fact that the
  service/person that gets the fund sign the transaction to prove he has the key
  to release fund and avoid we send data into the ether
- The creation of a safe switch that can be triggered by a third party that can
  act as a guardian for certain transactions but also freeze the account in
  case of an emergency.
- Use a custodial guardian to change keys based on an email. Coupled with a
  web signer, this enable the design of a web solution.
- Prebuilt modules for DAOs
- Starknet implement other schemes like secp256k1. the Ethereum Elliptic Curve
Cryptography. It is already possible, with the OpenZeppelin account, to sign
transactions with a key from an Ethereum Signers. We could leverage this feature
and possibly others in the future.

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
manager/registry/interfaces like [Safe{Core} Protocol](https://forum.safe.global/t/safe-core-protocol-whitepaper/3949) does or on something like
[EIP-7484](https://eips.ethereum.org/EIPS/eip-7484).

Assuming we can call a library from the __validate__ entrypoint, we propose the following:
- the list of validator modules should be managed in a library so that it can be checked at execution time
- we should have a contract with the expired validator so that the lib does not change, we can blacklist a validator. In that case, it would be executed in the __execute__

## Other considerations

- create a test account that succeeds the estimate_fee and the \_\_validate\_\_ 
  but fails the \_\_execute\_\_ to understand how failed transactions are
  charged. It should be easy: (a) run okay without a signature and (b) fail in
  the execution where there is a signature.
- monitor the number of steps used in various \_\_validate\_\_ scenarios
- present the project to starkware and/or be involved with hackathons
- check the zerodev.app business model to provide something similar
- build a community to support the project and get help on the project
