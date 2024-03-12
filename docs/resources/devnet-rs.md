# Using `starknet-devnet-rs`

## Install and Start devnet

`starknet-devnet-rs` is the rust version of Starknet Devnet that should be easy
to use. To get details about the project, check the
[github repository](https://github.com/0xSpaceShard/starknet-devnet-rs), the
[starknet book](https://book.starknet.io/) and the online help for more details.

To install `starknet-devnet-rs`:

- make sure you have rust/cargo installed

```shell
cargo --version
cargo 1.76.0 (c84b36747 2024-01-18)

rustc --version
rustc 1.76.0 (07dca489a 2024-02-04)
```

Install the project from crates.io

```shell
cargo install starknet-devnet
[...]
    Finished release [optimized] target(s) in 29m 27s
  Installing /Users/0xknwn/.cargo/bin/starknet-devnet
   Installed package `starknet-devnet v0.0.3` (executable `starknet-devnet`)
```

```shell
~/.cargo/bin/starknet-devnet --

Predeployed FeeToken
ETH Address: 0x49D36570D4E46F48E99674BD3FCC84644DDD6B96F7C741B1562B82F9E004DC7
STRK Address: 0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d
Class Hash: 0x046ded64ae2dead6448e247234bab192a9c483644395b66f2155f2614e5804b0

Predeployed UDC
Address: 0x41A78E741E5AF2FEC34B695679BC6891742439F7AFB8484ECD7766661AD02BF
Class Hash: 0x7B3E05F48F0C69E4A65CE5E076A66271A527AFF2C34CE1083EC6E1526997A69

Chain ID: SN_GOERLI (0x534e5f474f45524c49)

| Account address |  0x2ef212c6a9ba76d484cac3c640d8f84183bce12246a6d483ad0642198d18ebd
| Private key     |  0xded20a4c0c1f5f91366d4abe6d14ff0d
| Public key      |  0xbccde0de09f0e9c3bb08dacbd55af8856e03c771e78fd9e750983fa2cc647e

[...]

Predeployed accounts using class with hash: 0x61dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f
Initial balance of each account: 1000000000000000000000 WEI and FRI
Seed to replicate this account sequence: 2690304309
```

