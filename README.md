# starknet-modular-account

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
- What if we could find extensions in an "AppStore", trust and configure them
  in our account, have the app and SDK to rely on them from external services?
  We need to make it *easy*
- What if we can iterate and improve those solutions? We need to make it *now*

In order to iterate over account extensibility, we need to have a reference
implementation that we could use, experiment and battle test. This would allow
to get more developers and also to provide more advanced features in dapps.

Also, we do not want to wait for protocol changes like the introduction of the
Paymaster or the ability to customize the Nonce. We did not
see them in the [2024 roadmap](https://community.starknet.io/t/starknet-2024-roadmap-plan-of-intent/113006) and we know, for instance, from
[Mattéo Georges answer in Dec 2023](https://community.starknet.io/t/snip-strk-fee-token/101924/15)
is not yet prioritized. We can build and test solutions that we know we will
be able to improve reliably later. We would like to explore solutions like:

- [Porting the Plugin Account](https://github.com/argentlabs/starknet-plugin-account)
  if that is still feasible
- [EIP-7579 Minimal Modular Smart Accounts](https://eips.ethereum.org/EIPS/eip-7579).
- [EIP-6900: Modular Smart Contract Accounts and Plugins](https://eips.ethereum.org/EIPS/eip-6900) 
- [EIP-6963 Multi Injected Provider Discovery Using window events to announce injected Wallet Providers](https://eips.ethereum.org/EIPS/eip-6963)

We would like to address advanced scenarios from those accounts like recurring
payments, maximum allowance, auto-signed transactions, validating from FaceID or
fingerprints, apply from votes or an Oracle, timed-blocked transactions... Sky
is the limit!

## Bullish on Passkeys/WebAuthn:

Ethereum is based on secp256k1 when secp256r1, with a **R** is the signature
validated by the NIST and the basis for a number of protocols including TLS,
DNSSEC, Apple’s Secure Enclave, Passkeys, Android Keystore or Yubikey. Starknet
supports with v0.12.3 secp256r1 as part of
[Starknet OS](https://community.starknet.io/t/starknet-next-versions-v0-12-3-v0-13-0-and-sepolia-testnet-migration/106529)

You can find an implementation of an account that provides support for passkeys
in the [https://github.com/cartridge-gg/cairo-webauthn](Cartridge Controller)
and you can even test the flow on their
[connection page](https://x.cartridge.gg/login)... That is for sure something
that can easily be reproduced for other use cases with the help of the
[WebAuthn Chrome Web Developer Codelabs](https://developers.google.com/codelabs/webauthn-reauth)
