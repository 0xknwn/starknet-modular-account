## starkli

Starkli is useful to perform some specific tasks that cannot be done with
`scarb` or `starknet foundry`. For instance, it provides a command named
`class-hash` that compute the classhash from the sierra compiled version of a
contract.

## Installing starkli

To install starkli from the sources, run:

```shell
cargo install --locked --git https://github.com/xJonathanLEI/starkli
starkli --help
```

## Finding a classhash

To get the class-hash from a Sierra compiled code, run `starkli class-hash` with
the file you need to check like below:

```shell
starkli class-hash target/dev/smartr_Account.contract_class.json
```
