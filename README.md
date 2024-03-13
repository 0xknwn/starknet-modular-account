# starknet-modular-account

## Why

This project should come with a first implementation of a Modular Account for
the current version of Starknet. There are already numerous implementation of
Abstract Accounts, some of which provide awesome features like:

- the [Guarded WebWallet Account](https://github.com/argentlabs/argent-contracts-starknet) from Argent
- the [passkey/webauthn controller](https://github.com/cartridge-gg/cairo-webauthn) from Cartridge
- the [Starksign Multisig from Equilibrium](https://github.com/eqlabs/starknet-multisig),
  the [one from Braavos](https://github.com/myBraavos/braavos-account-cairo) and
  the [one from Argent](https://github.com/argentlabs/argent-contracts-starknet)
- the MIT-licensed [well documented](https://docs.openzeppelin.com/contracts-cairo/0.10.0/accounts) 
  and reusable[ Abstract Account from OpenZeppelin](https://github.com/OpenZeppelin/cairo-contracts/tree/main/src/account)

In addition to that, Starkware provides a nice workshop about
[Abstract Account development](https://github.com/starknet-edu/aa-workshop) and
the [Starknet Book](https://book.starknet.io) has several sections about
accounts and multisig.

Not only we can agree that each wallets have a different positioning but also
that they are key to the current success of Starknet. Besides, we could be
better and help the Ecosystem to thrive:

- What if we could have the same set of features that exists in EVM Wallets and
  Multisig like Safe? We need *extensibility* 
- What if we could program Argent-X, OpenZeppelin and Braavos accounts with the
  same code? We need *interoperability*
- What if we could still trust our accounts? We need *security*
- What if we could find extensions in a Market Place, trust and configure them
  in our account, have the app and SDK to rely on them from external services?
  We need to make it frictionless. We need to make it is *easy*
- What if we can iterate and improve those solutions? We need to make it *now*

In order to iterate over account extensibility, we need to have a reference
implementation that we could use, experiment and battle test. This would allow
to get more developers and also to provide more advanced features in dapps.

Also, we do not want to wait for protocol changes like the introduction of the
Paymaster or the ability to customize the Nonce. We did not
see them in the [2024 roadmap](https://community.starknet.io/t/starknet-2024-roadmap-plan-of-intent/113006) and we know, for instance, from
[Mattéo Georges answer in Dec 2023](https://community.starknet.io/t/snip-strk-fee-token/101924/15)
is not yet prioritized. We can build and test solutions that we know we will
be able to improve reliably later.

## How

We would like to explore solutions like:

- [Porting the Plugin Account](https://github.com/argentlabs/starknet-plugin-account)
  if that is still feasible
- [EIP-7579 Minimal Modular Smart Accounts](https://eips.ethereum.org/EIPS/eip-7579).
- [EIP-6900: Modular Smart Contract Accounts and Plugins](https://eips.ethereum.org/EIPS/eip-6900)
  including the Smart Account implementations by Circle and Alchemy.
- Study bespoke solutions, from the
  [Safe Module system](https://docs.safe.global/smart-account-modules) to the
  [Safe{} Protocol](https://forum.safe.global/t/safe-core-protocol-whitepaper/3949)
  and to all the current smart account extension abilities, like SimpleAccount,
  Argent, Alchemy, Kernel...

> Notes:
> - a nice feature is to be able to activate module offchain so that you pay for
>   the fees only if an event occurs.
> - another nice feature of module is the ability to compose them together. The
>   requirement to execute a module by calling it with execTransaction seems to
>   prevent that behaviour. We need to study it in both the context of EIP-6900
>   that is probably preventing it and Safe{Core} Protocol.
> - the way module stores data when enabled can be a concern for upgrades. We
>   should look at this in the context of plugin account
> - the use of a standardized plugin protocol also opens the door to the
>   integration of the shipping of client-side SDK and UI components to ease 
>   and help the use to interact with the plugin in the context of a service.
>   This would help provide installation/blocking and also standardize
>   behaviours on the dapp or in the signer.
> - the concerns we have identified sofar are that:
>   - if somehow we need to reverse transactions and some fees are taken, we 
>     could end-up in a situation when someone fails transaction on purpose.
>   - if the plugin stores data in the account, for instance to check for an
>     allowance how can we guarranty that there is no collision overtime,
>     including on purpose. How can we also guarranty those data are not lost
>     with a plugin upgrade
>   - how to we check for security when modules are combined because, it is
>     great, except that it could very well be that together module are dangerous
>     when used standalone, they are actually fine

## What for

Modules help to address advanced scenarios. Ethereum existing solutions comes
with endless inspirations for what can be done with those. They are usually
classified in 4 groups:

- Roles: e.g. spending limits, associated token: vTokens, NFT(id) or Oracle,
  multiple factor for administrative privileges, recurring payments, alternative
  signatures including faceid or fingerprints, zkproof, Merkle tree for Offchain
  ACL
- Recovery: e.g. social recovery, custodial recovery, physical devices, other
  secrets validation
- Protection: allow/deny list, freeze account, external whitelisting, Oracle
  MEV protection
- Modifiers: time-lock, cooldown/grace period, bonds

Sky is the limit!

If you want to dig deeper into some of the many scenarios associated with Module,
we recommand you have a look at existing implementations like:
- [Safe Modules](https://github.com/safe-global/safe-modules)
- [Zodiac Modules](https://github.com/gnosisguild/zodiac)
- [A list of modules and resources by Rhinestone](https://github.com/rhinestonewtf/awesome-modular-accounts)

Hackathons and ideas popping around include:

- The Ability to activate a module Offchain from a session key, see
  [Why we are building Kernel on ERC-7579](https://docs.zerodev.app/blog/why-7579-over-6900)
  in the Zerodev.app.
- A Module Store, i.e a Market Place that whitelist/block and easy the addition
  and moneytizations of modules
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

Some of those scenarios are very popular and detailed below:

### Session Key

This would allow to provide access to a signer and not only a transaction see
is as a "sign the signer not the transaction". In this scenario, the grant can
be done (1) Offchain with (2) the merkle tree root of a set ACL or a set of
Nonce (i.e. Nonce Maps that can be filled) and (3) limits (e.g. Timed-Based or
Allowance). Those keys can then git given to a video game for autosigning
transactions or to a bot to execute a stop-loss order.

### Passkeys/WebAuthn:

secp256r1, with a **R** is the signature validated by the NIST and the basis for
a number of protocols including TLS, DNSSEC, Apple's Secure Enclave, Passkeys,
Android Keystore or Yubikey. Starknet supports with v0.12.3 secp256r1 as part of
[Starknet OS](https://community.starknet.io/t/starknet-next-versions-v0-12-3-v0-13-0-and-sepolia-testnet-migration/106529)

You can find an implementation of an account that provides support for passkeys
in the [Cartridge Controller](https://github.com/cartridge-gg/cairo-webauthn)
and you can even test the flow on their
[connection page](https://x.cartridge.gg/login)... That is for sure something
that can easily be reproduced for other use cases with the help of the
[WebAuthn Chrome Web Developer Codelabs](https://developers.google.com/codelabs/webauthn-reauth)

### secp256k1

Not sure secp256k1, i.e. the Ethereum Elliptic Curve Cryptography is part of
Starknet. If it is or if there is a library that implement it on top of
starknet, then it would be possible to sign transaction with keys from
Ethereum Signers.
