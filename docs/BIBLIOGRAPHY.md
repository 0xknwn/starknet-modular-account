
## Starknet Accounts and Network Updates

There are already numerous implementations of Abstract Accounts, many of which
provide awesome features:

- the [Guarded WebWallet Account](https://github.com/argentlabs/argent-contracts-starknet)
  from Argent
- the [passkey/webauthn controller](https://github.com/cartridge-gg/cairo-webauthn)
  from Cartridge. You can test the connection flow on their
  [connection page](https://x.cartridge.gg/login)
- the [Starksign Multisig from Equilibrium](https://github.com/eqlabs/starknet-multisig),
  the [WebWallet from Braavos](https://github.com/myBraavos/braavos-account-cairo) and
  the [WebWallet from Argent](https://github.com/argentlabs/argent-contracts-starknet)
- the MIT-licensed [well documented](https://docs.openzeppelin.com/contracts-cairo) 
  and reusable [Abstract Account from OpenZeppelin](https://github.com/OpenZeppelin/cairo-contracts/tree/main/src/account)
- Starkware provides a nice workshop about
  [Abstract Account development](https://github.com/starknet-edu/aa-workshop)
  and the [Starknet Book](https://book.starknet.io) has several sections about
  accounts and multisig.
- The [Cairo v0 Plugin Account](https://github.com/argentlabs/starknet-plugin-account)
  provides some implementation ideas

The [2024 Starknet roadmap](https://community.starknet.io/t/starknet-2024-roadmap-plan-of-intent/113006) provides some details about the expected features. In particular, see
[Mattéo Georges answer in Dec 2023](https://community.starknet.io/t/snip-strk-fee-token/101924/15)
that suggests the Paymaster is not yet prioritized.

## Proposals, Whitepapers and Docs for Ethereum Accounts

- Adam Egyed (@adamegyed), Fangting Liu (@trinity-0111), Jay Paik (@jaypaik),
  Yoav Weiss (@yoavw), Huawei Gu (@huaweigu), Daniel Lim (@dlim-circle),
  Zhiyu Zhang (@ZhiyuCircle), "ERC-6900: Modular Smart Contract Accounts and
  Plugins [DRAFT]," Ethereum Improvement Proposals, no. 6900, April 2023.
  [Online serial]. Available: https://eips.ethereum.org/EIPS/eip-6900.
- zeroknots (@zeroknots), Konrad Kopp (@kopy-kat), Taek Lee (@leekt), Fil
  Makarov (@filmakarov), Elim Poon (@yaonam), Lyu Min (@rockmin216), "ERC-7579:
  Minimal Modular Smart Accounts [DRAFT]," Ethereum Improvement Proposals, no.
  7579, December 2023. [Online serial].
  Available: https://eips.ethereum.org/EIPS/eip-7579.
- [Safe Module system](https://docs.safe.global/smart-account-modules) that
  supports an alpha implementation of the
  [Safe{Core} Protocol](https://forum.safe.global/t/safe-core-protocol-whitepaper/3949)
- The [Kernel Smart Contract](https://github.com/zerodevapp/kernel)

## Module Registry

- Konrad Kopp (@kopy-kat), zeroknots (@zeroknots), "ERC-7484: Registry Extension
  for ERC-7579 [DRAFT]," Ethereum Improvement Proposals, no. 7484, August 2023.
  [Online serial]. Available: https://eips.ethereum.org/EIPS/eip-7484.

## Module Use-Cases

Modules help to address advanced scenarios. They are often classified in 4
groups:

- Roles: e.g. spending limits, associated token: vTokens, NFT(id) or Oracle,
  multiple factor for administrative privileges, recurring payments, alternative
  signatures including faceid or fingerprints, zkproof, Merkle tree for Offchain
  ACL
- Recovery: e.g. social recovery, custodial recovery, physical devices, other
  secrets validation
- Protection: e.g. allow/deny list, freeze account, external whitelisting, Oracle
  MEV protection
- Modifiers: e.g. time-lock, cooldown/grace period, bonds

To dig deeper into some of the many scenarios associated with Module, you can
have a look at existing implementations like:
- [Safe Modules](https://github.com/safe-global/safe-modules)
- [Zodiac Modules](https://github.com/gnosisguild/zodiac)
- [A list of modules and resources by Rhinestone](https://github.com/rhinestonewtf/awesome-modular-accounts)
- [Safe Hackathon Ideas](https://safe-global.notion.site/d75c813772f54528990a9b5c2f5cb375?v=96a818baabe242e3ad25aad66722b2bb)
