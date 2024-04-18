# Development Guidelines

Before starting development, please [create an issue](https://github.com/0xknwn/starknet-modular-account/issues/new/choose) to open the discussion, validate
that the PR is wanted and coordinate with the team.

Please check this document to make sure your contributions are merged as soon as
possible.

## Table of Contents

- [Development Guidelines](#development-guidelines)
  - [Table of Contents](#table-of-contents)
  - [Pull Requests (PRs)](#pull-requests-prs)
  - [Code Reviews](#code-reviews)
  - [Environment](#environment)
  - [Useful Commands](#useful-commands)
  - [Getting ETH on Sepolia](#getting-eth-on-sepolia)
  - [Learning Starknet/Cairo](#learning-starknetcairo)
  - [More questions](#more-questions)

## Pull Requests (PRs)

As a contributor, you are expected to fork this repository, work on your own
fork and then submit pull requests. The pull requests will be reviewed and
eventually merged into the repository. See
["Fork-a-Repo"](https://help.github.com/articles/fork-a-repo/) for how to
work.

The typical PR includes:

- a branch associated with the PR should be rebased to the head of `develop`
- documentation that complies with the PR template. Make sure every section of
  it is properly fullfilled

## Code Reviews

Maintainers will review your code and ask for changes if necessary you code can
be merged into the repository. Be mindful and forgiving as we might not be
available right on.

Many of the issues we are facing during the code review are due to a lack of
context. Do not hesitate to explain why you are doing what you are doing.

> **IMPORTANT** Pay attention to the maintainer's feedback and do the changes
> accordingly.

## Environment

The project uses a number of tools. Make sure you have installed them in order
to develop and test:

- [scarb](https://docs.swmansion.com/scarb/).
- [starknet foundry](https://foundry-rs.github.io/starknet-foundry/)
- [node 20+ and npm](https://nodejs.org/en)
- [mitmproxy](https://mitmproxy.org/)
- [starknet-devnet-rs](https://github.com/0xSpaceShard/starknet-devnet-rs)
- [rust and cargo](https://www.rust-lang.org/)
- [starknet.js](https://github.com/starknet-io/starknet.js)
- [abi-wan-kanabi](https://github.com/keep-starknet-strange/abi-wan-kanabi)
- [git](https://git-scm.com/) and [github.com](https://github.com)

Once you have forked/cloned the repository, you should create a
`.env.devnet.json` file at the root of the project. You can simply copy the
content of `.env.template.json` if you plan to use the devnet on the default
port and with the account associated with the seed `0`!

## Useful Commands

- (1) fetch the project cairo dependencies

```shell
scarb fetch
```

- (2) build the project artifacts

```shell
scarb build
```

- (3) execute starknet foundry tests

```shell
# you can also use: snforge test
scarb test
```

- (4) start starknet-devnet on the default port 

```shell
starknet-devnet --seed=0
```

- (5) create a configuration file to run the project against the devnet

```shell
cp .env.template.json .env.devnet.json
```

- (6) install node dependencies

```shell
npm install
```

- (7) execute the npm `test` scripts with a specific test suite

```shell
npm run test -- simple_account.test.ts
```

- (8) start mitmproxy with the browser UI on port 8080 and redirect all the
  requests to the default starknet. You can then change the url in
  `.env.devnet.json` so that you run the tests through `http://localhost:8080` 

```shell
mitmweb --mode reverse:http://localhost:5050
```

## Getting ETH on Sepolia

To get ETH on Starknet Sepolia
- there is a [Faucet on blast.io](https://blastapi.io/faucets/starknet-sepolia-eth)
- the starknet book explains how to
  [bridge ETH with Starknet](https://book.starknet.io/ch02-05-01-start-with-sepolia.html)

## Learning Starknet/Cairo

If you are not used to Starknet and Cairo yet, a good starting point is to learn
is the list of ressources below:

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

Do not hesitate to join the Starkware Discord and some Telegram Developer
Groups...

## More questions

If you have any questions, feel free to post them as an
[issues](https://github.com/0xknwn/starknet-modular-account/issues).

Thanks for your time and code!
