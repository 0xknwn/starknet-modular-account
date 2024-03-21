This document presents the tools and resources used to build the project. It
references what you should learn and what tools you should use.

## Learning

To learn, a good starting point is
- [Awesome Starknet](https://github.com/keep-starknet-strange/awesome-starknet)
- [Cairo Compiler](https://github.com/starkware-libs/cairo)
- [Cairo Book](https://book.cairo-lang.org/)
- [Cairo By Example](https://cairo-by-example.com/)
- [Starknet Documentation](https://docs.starknet.io/documentation/) and the
- [Starknet Developer Portal](https://www.starknet.io/en/developers), the
- [Starknet Community Portal](https://community.starknet.io/).
- [Starknet Book](https://book.starknet.io/)
- [Starknet Improvement Proposals](https://github.com/starknet-io/SNIPs)
- [Starknet By Example](https://github.com/NethermindEth/StarknetByExample)
- [Starklings Cairo](https://github.com/shramee/starklings-cairo1.git)

## Developing

There is no specific order to the presentation below. Feel free to add some
more resources and document them if needed:

- [starknet-devnet-rs](./resources/devnet-rs.md) is a rust version of the
  starknet devnet. It is not completed yet but can be used in a number of cases
- [katana](https://book.dojoengine.org/toolchain/katana/overview) is another
  rust version of a devnet and might also be used to run tests locally
- [abi-wan-kanabi](./resources/abi-wan-kanabi.md) is a javascript package that
  extract the ABI from a built contract and generates the associated typescript
- [scarb](./resources/scarb.md) provides a compiler and the dependency manager
  for cairo
- [starkli](./resources/starkli.md) is a CLI to interact with starknet
- [mitmproxy](./resources/mitmproxy.md) is a proxy and reverse proxy that can be used to
  capture payload and help better understand how they work
- starknet foundry with snforge et sncast
- Vscode Cairo 1.0 Extension and Scarb Language Server
- starknet.js https://github.com/starknet-io/starknet.js
- https://walnut.dev/

Also note that Starkware provides nice workshops and learning resources
including the [Abstract Account development](https://github.com/starknet-edu/aa-workshop)

## Testing the project

In order to test the project, you need to run the `starknet-devnet` with the
`--seed=0` option and add a `.env.devnet.json` with 3 accounts:
- 2 accounts that are used to deploy the counter contract and run some tests
- the target account that should be used to deploy our own account and test it
  with the `counter` contract.

The `.env.template.json` provides the current values. You should be able to
simply copy it into `.env.devnet.json` like below:

```shell
cd smartr_account
cp .env.template.json .env.devnet.json
```

Once done, make sure `scarb` and `starknet foundry` are installed and build the
project:

```shell
cd smartr_account
scarb build
scarb run test
```

The you should be able to run tests like below:

```shell
npm install
npm run test -- utils.test.ts
npm run test -- counter.test.ts
npm run test -- account.test.ts
```

> Note: for the account test to work, the `counter.test.ts` must have been run
> as it deploys the Counter contract.

## Other considerations

- To get ETH on Starknet Sepolia
  - there is a [Faucet on blast.io](https://blastapi.io/faucets/starknet-sepolia-eth)
  - the starknet book explains how to
    [bridge ETH with Starknet](https://book.starknet.io/ch02-05-01-start-with-sepolia.html)
