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

## Create An account

To create an account with `starkli`, start by creating a keystore with a
private key. For instance, set the proper variable for (1) the keystore, (2)
storing the account and (3) connecting to your network (here starknet-sepolia)
with blast:

```shell
mkdir -p ~/.starkli-wallets/deployer
export STARKNET_ACCOUNT=~/.starkli-wallets/deployer/account.json
export STARKNET_KEYSTORE=~/.starkli-wallets/deployer/keystore.json
export STARKNET_RPC=https://starknet-sepolia.public.blastapi.io
```

Once done, create the keystore with the command below:

```shell
starkli signer keystore from-key $STARKNET_KEYSTORE
```

The output looks like this:

```text
Enter private key:
Enter password:
Created new encrypted keystore file: ~/.starkli-wallets/deployer/keystore.json
Public key: 0x043509294b2dc69be8df108fc3688da9434452039a3757ac58fe5c98cacfbafd
```

To create an account, for instance with the openzeppelin version of it, you can
compute the address with the command below:

```shell
starkli account oz init $STARKNET_ACCOUNT
```

The output looks like this:

```text
Enter keystore password:
Created new account config file: ~/.starkli-wallets/deployer/account.json

Once deployed, this account will be available at:
    0x03b2d6d0edcbdbdf6548d2b79531263628887454a0a608762c71056172d36240

Deploy this account by running:
    starkli account deploy ~/.starkli-wallets/deployer/account.json
```

You can send ETH to the account. A simple way to proceed, in the case of
starknet sepolia is to go to a Faucet, like the
[blast.io faucet](https://blastapi.io/faucets/starknet-sepolia-eth) and enter
the account as a destination for the ETH. Once done, the account can be deployed

```shell
starkli account deploy $STARKNET_ACCOUNT
```

The output looks like this:

```text
Enter keystore password:
The estimated account deployment fee is 0.000088400000000000 ETH. However, to avoid failure, fund at least:
    0.000132600000000000 ETH
to the following address:
    0x03b2d6d0edcbdbdf6548d2b79531263628887454a0a608762c71056172d36240
Press [ENTER] once you've funded the address.
Account deployment transaction: 0x05c78bb1908fb1b85c4aa3a54cc449259f9dccc714187f4e9d80648992863e98
Waiting for transaction 0x05c78bb1908fb1b85c4aa3a54cc449259f9dccc714187f4e9d80648992863e98 to confirm. If this process is interrupted, you will need to run `starkli account fetch` to update the account file.
Transaction not confirmed yet...
Transaction 0x05c78bb1908fb1b85c4aa3a54cc449259f9dccc714187f4e9d80648992863e98 confirmed
```

You can check the account on one of the existing block explorer like
[starkscan](https://sepolia.starkscan.co) or [voyager](https://voyager.online/).

To get the private key from the store, use:

```shell
starkli signer keystore inspect-private $STARKNET_KEYSTORE
```
