# Using Starkli to Declare Contract

Once successfully compiled, declaring the contract to the starknet networks is
one of the key operation to perform. This document digs into this specific task.

## Create a keystore

Keystores are encrypted files that contains the private keys and used to
interact with the accounts. Below are 2 examples of creating keystore for
later usage:

- create a kestore that generates a random keypair to use with an account:

```shell
starkli signer keystore new ~/.starkli/config/localstore
```

- create a kestore with an existing private key, in that case the key from the
  first account of the devnet when started with --seed=0

```shell
starkli signer keystore from-key ~/.starkli/config/seed0store
```

For the last case, the output looks like below which confirms the private key
has been correctly entered:

```text
Enter private key:
Enter password:
Created new encrypted keystore file: ~/.starkli/config/seed0store
Public key: 0x039d9e6ce352ad4530a0ef5d5a18fd3303c3606a7fa6ac5b620020ad681cc33b
```

> Note:
> To create a keystore for the account0 of the devnet, you can simply run
> the command below

```shell
echo "0x0000000000000000000000000000000071d7bb07b9a64f6f78ac4c816aff4da9" | \
  starkli signer keystore from-key --private-key-stdin \
  --password $STARKNET_KEYSTORE_PASSWORD $STARKNET_KEYSTORE
```

## Using a specific network

To simplify the 

```shell
unset STARKNET_RPC
export STARKNET_KEYSTORE=~/.starkli/config/localstore
export STARKNET_KEYSTORE_PASSWORD=x
export STARKNET_ACCOUNT=~/.starkli/config/account0.json
```

```shell
export STARKNET_RPC="http://localhost:5050/"
export STARKNET_KEYSTORE=~/.starkli/config/seed0store
export STARKNET_KEYSTORE_PASSWORD=x
export STARKNET_ACCOUNT=~/.starkli/config/seed0account0.json
```

## Prepare to deploy an account


starkli account oz init $STARKNET_ACCOUNT

Created new account config file: ~/.starkli/config/account0

Once deployed, this account will be available at:
    0x001092adfb342fdfe65dddd0a56c4322d3d0e5bcb5e813d34cc825935463eb49

Deploy this account by running:
    starkli account deploy $STARKNET_ACCOUNT

## Deploy an account

starkli account oz deploy --fee-token STRK $STARKNET_ACCOUNT

Enter keystore password:
The estimated account deployment fee is 0.005455228013553563 STRK. However, to avoid failure, fund at least:
    0.012033591204875200 STRK
to the following address:
    0x001092adfb342fdfe65dddd0a56c4322d3d0e5bcb5e813d34cc825935463eb49
Press [ENTER] once you've funded the address.
Account deployment transaction: 0x00a562f27db1c7b37428e618a4e076c4a457facb0a46bc345b752b515e96de55
Waiting for transaction 0x00a562f27db1c7b37428e618a4e076c4a457facb0a46bc345b752b515e96de55 to confirm. If this process is interrupted, you will need to run `starkli account fetch` to update the account file.
Transaction not confirmed yet...
Transaction 0x00a562f27db1c7b37428e618a4e076c4a457facb0a46bc345b752b515e96de55 confirmed

## Fetch an existing account

starkli account fetch --output $STARKNET_ACCOUNT \
  0x064b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691
Account contract type identified as: OpenZeppelin
Description: OpenZeppelin account contract v0.8.1 compiled with cairo v2.4.1
Downloaded new account config file: /Users/gregory/.starkli/config/seed0account0.json

## check

starkli transaction 0x00a562f27db1c7b37428e618a4e076c4a457facb0a46bc345b752b515e96de55

{
  "transaction_hash": "0xa562f27db1c7b37428e618a4e076c4a457facb0a46bc345b752b515e96de55",
  "type": "DEPLOY_ACCOUNT",
  "version": "0x3",
  "signature": [
    "0x19c7b2400e8c9027a2d51277367e787f0a82f57aed0bd0d00a5ac029f146eb4",
    "0x446a2993fc34e4c0e24ebc4dba6aa78d3524a208a0d5c5320384cb9c5a031ae"
  ],
  "nonce": "0x0",
  "contract_address_salt": "0x421a3776f85fada8547c401bbbfe4c92d28534da3cd7404223310a7bc01dd5f",
  "constructor_calldata": [
    "0x36fc23c7bc7294e777fa60ce8268a791c88ca4ca9de4de7209107b66d201e7"
  ],
  "class_hash": "0x4a444ef8caf8fa0db05da60bf0ad9bae264c73fa7e32c61d245406f5523174b",
  "resource_bounds": {
    "l1_gas": {
      "max_amount": "0x19",
      "max_price_per_unit": "0x1b5c78d2a61c0"
    },
    "l2_gas": {
      "max_amount": "0x0",
      "max_price_per_unit": "0x0"
    }
  },
  "tip": "0x0",
  "paymaster_data": [],
  "nonce_data_availability_mode": "L1",
  "fee_data_availability_mode": "L1"
}


% starkli receipt 0x00a562f27db1c7b37428e618a4e076c4a457facb0a46bc345b752b515e96de55

{
  "transaction_hash": "0xa562f27db1c7b37428e618a4e076c4a457facb0a46bc345b752b515e96de55",
  "actual_fee": {
    "amount": "0x11f23804211321",
    "unit": "FRI"
  },
  "finality_status": "ACCEPTED_ON_L2",
  "messages_sent": [],
  "events": [
    {
      "from_address": "0x1092adfb342fdfe65dddd0a56c4322d3d0e5bcb5e813d34cc825935463eb49",
      "keys": [
        "0x38f6a5b87c23cee6e7294bcc3302e95019f70f81586ff3cac38581f5ca96381",
        "0x36fc23c7bc7294e777fa60ce8268a791c88ca4ca9de4de7209107b66d201e7"
      ],
      "data": []
    },
    {
      "from_address": "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
      "keys": [
        "0x99cd8bde557814842a3121e8ddfd433a539b8c9f14bf31ebf108d12e6196e9"
      ],
      "data": [
        "0x1092adfb342fdfe65dddd0a56c4322d3d0e5bcb5e813d34cc825935463eb49",
        "0x1176a1bd84444c89232ec27754698e5d2e7e1a7f1539f12027f28b23ec9f3d8",
        "0x11f23804211321",
        "0x0"
      ]
    }
  ],
  "execution_resources": {
    "steps": 6498,
    "range_check_builtin_applications": 251,
    "pedersen_builtin_applications": 26,
    "poseidon_builtin_applications": 5,
    "ec_op_builtin_applications": 3,
    "data_availability": {
      "l1_gas": 0,
      "l1_data_gas": 288
    }
  },
  "execution_status": "SUCCEEDED",
  "type": "DEPLOY_ACCOUNT",
  "contract_address": "0x1092adfb342fdfe65dddd0a56c4322d3d0e5bcb5e813d34cc825935463eb49",
  "block_hash": "0x50517a32de6d306fae313aabae4723e5201904570a5d2a8b5d83f36647b29f1",
  "block_number": 531619
}

## Declare the Counter

starkli declare --account ~/.starkli/config/account0 --keystore ~/.starkli/config/localstore --fee-token STRK smartr_Counter.contract_class.json --casm-file smartr_Counter.compiled_contract_class.json
WARNING: you're using neither --rpc (STARKNET_RPC) nor --network (STARKNET_NETWORK). The `sepolia` network is used by default. See https://book.starkli.rs/providers for more details.
Enter keystore password:
Declaring Cairo 1 class: 0x06148678c64a3d1a354af0aaff3da7a1d76b17b8ef13d4dc09552063acc1d5fe
Using a compiled CASM file directly: smartr_Counter.compiled_contract_class.json...
CASM class hash: 0x0218aecbdf519ef9b18aec25234256cb884014e7dca263c8a04bb9a0190d019b
Contract declaration transaction: 0x057bd4f315965d08a03d0021e1c36e237edf457669b78570e1a65b9a11ba86b7
Class hash declared:
0x06148678c64a3d1a354af0aaff3da7a1d76b17b8ef13d4dc09552063acc1d5fe
