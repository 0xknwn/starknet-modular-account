[starknet-test-helpers](README.md) / Exports

# starknet-test-helpers

## Table of contents

### Classes

- [Counter](classes/Counter.md)
- [ERC20](classes/ERC20.md)
- [SwapRouter](classes/SwapRouter.md)

### Type Aliases

- [AccountConfig](modules.md#accountconfig)
- [Config](modules.md#config)

### Variables

- [CounterABI](modules.md#counterabi)
- [default\_timeout](modules.md#default_timeout)
- [udcAddress](modules.md#udcaddress)

### Functions

- [ETH](modules.md#eth)
- [STRK](modules.md#strk)
- [accountAddress](modules.md#accountaddress)
- [classHash](modules.md#classhash)
- [config](modules.md#config-1)
- [counterAddress](modules.md#counteraddress)
- [declareClass](modules.md#declareclass)
- [deployAccount](modules.md#deployaccount)
- [deployCounter](modules.md#deploycounter)
- [deploySimpleAccount](modules.md#deploysimpleaccount)
- [deploySwapRouter](modules.md#deployswaprouter)
- [deployTokenA](modules.md#deploytokena)
- [deployTokenB](modules.md#deploytokenb)
- [simpleAccountAddress](modules.md#simpleaccountaddress)
- [swapRouterAddress](modules.md#swaprouteraddress)
- [testAccounts](modules.md#testaccounts)
- [tokenAAddress](modules.md#tokenaaddress)
- [tokenBAddress](modules.md#tokenbaddress)

## Type Aliases

### AccountConfig

Ƭ **AccountConfig**: `Object`

Represents the configuration of an account.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `address` | `string` |
| `classHash?` | `string` |
| `privateKey` | `string` |
| `publicKey` | `string` |

#### Defined in

[sdks/starknet-test-helpers/src/utils.ts:7](https://github.com/0xknwn/starknet-modular-account/blob/b252147e67f1a93442e2234401250f5105244be9/sdks/starknet-test-helpers/src/utils.ts#L7)

___

### Config

Ƭ **Config**: `Object`

Represents the configuration for the test helpers.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `accounts` | [`AccountConfig`](modules.md#accountconfig)[] |
| `providerURL` | `string` |

#### Defined in

[sdks/starknet-test-helpers/src/utils.ts:21](https://github.com/0xknwn/starknet-modular-account/blob/b252147e67f1a93442e2234401250f5105244be9/sdks/starknet-test-helpers/src/utils.ts#L21)

## Variables

### CounterABI

• `Const` **CounterABI**: readonly [\{ `interface_name`: ``"smartr::presets::helpers::counter::ICounter"`` = "smartr::presets::helpers::counter::ICounter"; `name`: ``"CounterImpl"`` = "CounterImpl"; `type`: ``"impl"`` = "impl" }, \{ `items`: readonly [\{ `inputs`: readonly [] = []; `name`: ``"increment"`` = "increment"; `outputs`: readonly [] = []; `state_mutability`: ``"external"`` = "external"; `type`: ``"function"`` = "function" }, \{ `inputs`: readonly [\{ `name`: ``"args"`` = "args"; `type`: ``"core::array::Array::<core::felt252>"`` = "core::array::Array::\<core::felt252\>" }] ; `name`: ``"increment_by_array"`` = "increment\_by\_array"; `outputs`: readonly [] = []; `state_mutability`: ``"external"`` = "external"; `type`: ``"function"`` = "function" }, \{ `inputs`: readonly [\{ `name`: ``"value"`` = "value"; `type`: ``"core::integer::u64"`` = "core::integer::u64" }] ; `name`: ``"increment_by"`` = "increment\_by"; `outputs`: readonly [] = []; `state_mutability`: ``"external"`` = "external"; `type`: ``"function"`` = "function" }, \{ `inputs`: readonly [] = []; `name`: ``"get"`` = "get"; `outputs`: readonly [\{ `type`: ``"core::integer::u64"`` = "core::integer::u64" }] ; `state_mutability`: ``"view"`` = "view"; `type`: ``"function"`` = "function" }, \{ `inputs`: readonly [] = []; `name`: ``"reset"`` = "reset"; `outputs`: readonly [] = []; `state_mutability`: ``"external"`` = "external"; `type`: ``"function"`` = "function" }] ; `name`: ``"smartr::presets::helpers::counter::ICounter"`` = "smartr::presets::helpers::counter::ICounter"; `type`: ``"interface"`` = "interface" }, \{ `interface_name`: ``"openzeppelin::upgrades::interface::IUpgradeable"`` = "openzeppelin::upgrades::interface::IUpgradeable"; `name`: ``"UpgradeableImpl"`` = "UpgradeableImpl"; `type`: ``"impl"`` = "impl" }, \{ `items`: readonly [\{ `inputs`: readonly [\{ `name`: ``"new_class_hash"`` = "new\_class\_hash"; `type`: ``"core::starknet::class_hash::ClassHash"`` = "core::starknet::class\_hash::ClassHash" }] ; `name`: ``"upgrade"`` = "upgrade"; `outputs`: readonly [] = []; `state_mutability`: ``"external"`` = "external"; `type`: ``"function"`` = "function" }] ; `name`: ``"openzeppelin::upgrades::interface::IUpgradeable"`` = "openzeppelin::upgrades::interface::IUpgradeable"; `type`: ``"interface"`` = "interface" }, \{ `interface_name`: ``"openzeppelin::access::ownable::interface::IOwnable"`` = "openzeppelin::access::ownable::interface::IOwnable"; `name`: ``"OwnableImpl"`` = "OwnableImpl"; `type`: ``"impl"`` = "impl" }, \{ `items`: readonly [\{ `inputs`: readonly [] = []; `name`: ``"owner"`` = "owner"; `outputs`: readonly [\{ `type`: ``"core::starknet::contract_address::ContractAddress"`` = "core::starknet::contract\_address::ContractAddress" }] ; `state_mutability`: ``"view"`` = "view"; `type`: ``"function"`` = "function" }, \{ `inputs`: readonly [\{ `name`: ``"new_owner"`` = "new\_owner"; `type`: ``"core::starknet::contract_address::ContractAddress"`` = "core::starknet::contract\_address::ContractAddress" }] ; `name`: ``"transfer_ownership"`` = "transfer\_ownership"; `outputs`: readonly [] = []; `state_mutability`: ``"external"`` = "external"; `type`: ``"function"`` = "function" }, \{ `inputs`: readonly [] = []; `name`: ``"renounce_ownership"`` = "renounce\_ownership"; `outputs`: readonly [] = []; `state_mutability`: ``"external"`` = "external"; `type`: ``"function"`` = "function" }] ; `name`: ``"openzeppelin::access::ownable::interface::IOwnable"`` = "openzeppelin::access::ownable::interface::IOwnable"; `type`: ``"interface"`` = "interface" }, \{ `inputs`: readonly [\{ `name`: ``"owner"`` = "owner"; `type`: ``"core::starknet::contract_address::ContractAddress"`` = "core::starknet::contract\_address::ContractAddress" }] ; `name`: ``"constructor"`` = "constructor"; `type`: ``"constructor"`` = "constructor" }, \{ `kind`: ``"struct"`` = "struct"; `members`: readonly [\{ `kind`: ``"key"`` = "key"; `name`: ``"previous_owner"`` = "previous\_owner"; `type`: ``"core::starknet::contract_address::ContractAddress"`` = "core::starknet::contract\_address::ContractAddress" }, \{ `kind`: ``"key"`` = "key"; `name`: ``"new_owner"`` = "new\_owner"; `type`: ``"core::starknet::contract_address::ContractAddress"`` = "core::starknet::contract\_address::ContractAddress" }] ; `name`: ``"openzeppelin::access::ownable::ownable::OwnableComponent::OwnershipTransferred"`` = "openzeppelin::access::ownable::ownable::OwnableComponent::OwnershipTransferred"; `type`: ``"event"`` = "event" }, \{ `kind`: ``"struct"`` = "struct"; `members`: readonly [\{ `kind`: ``"key"`` = "key"; `name`: ``"previous_owner"`` = "previous\_owner"; `type`: ``"core::starknet::contract_address::ContractAddress"`` = "core::starknet::contract\_address::ContractAddress" }, \{ `kind`: ``"key"`` = "key"; `name`: ``"new_owner"`` = "new\_owner"; `type`: ``"core::starknet::contract_address::ContractAddress"`` = "core::starknet::contract\_address::ContractAddress" }] ; `name`: ``"openzeppelin::access::ownable::ownable::OwnableComponent::OwnershipTransferStarted"`` = "openzeppelin::access::ownable::ownable::OwnableComponent::OwnershipTransferStarted"; `type`: ``"event"`` = "event" }, \{ `kind`: ``"enum"`` = "enum"; `name`: ``"openzeppelin::access::ownable::ownable::OwnableComponent::Event"`` = "openzeppelin::access::ownable::ownable::OwnableComponent::Event"; `type`: ``"event"`` = "event"; `variants`: readonly [\{ `kind`: ``"nested"`` = "nested"; `name`: ``"OwnershipTransferred"`` = "OwnershipTransferred"; `type`: ``"openzeppelin::access::ownable::ownable::OwnableComponent::OwnershipTransferred"`` = "openzeppelin::access::ownable::ownable::OwnableComponent::OwnershipTransferred" }, \{ `kind`: ``"nested"`` = "nested"; `name`: ``"OwnershipTransferStarted"`` = "OwnershipTransferStarted"; `type`: ``"openzeppelin::access::ownable::ownable::OwnableComponent::OwnershipTransferStarted"`` = "openzeppelin::access::ownable::ownable::OwnableComponent::OwnershipTransferStarted" }]  }, \{ `kind`: ``"struct"`` = "struct"; `members`: readonly [\{ `kind`: ``"data"`` = "data"; `name`: ``"class_hash"`` = "class\_hash"; `type`: ``"core::starknet::class_hash::ClassHash"`` = "core::starknet::class\_hash::ClassHash" }] ; `name`: ``"openzeppelin::upgrades::upgradeable::UpgradeableComponent::Upgraded"`` = "openzeppelin::upgrades::upgradeable::UpgradeableComponent::Upgraded"; `type`: ``"event"`` = "event" }, \{ `kind`: ``"enum"`` = "enum"; `name`: ``"openzeppelin::upgrades::upgradeable::UpgradeableComponent::Event"`` = "openzeppelin::upgrades::upgradeable::UpgradeableComponent::Event"; `type`: ``"event"`` = "event"; `variants`: readonly [\{ `kind`: ``"nested"`` = "nested"; `name`: ``"Upgraded"`` = "Upgraded"; `type`: ``"openzeppelin::upgrades::upgradeable::UpgradeableComponent::Upgraded"`` = "openzeppelin::upgrades::upgradeable::UpgradeableComponent::Upgraded" }]  }, \{ `kind`: ``"enum"`` = "enum"; `name`: ``"smartr::presets::helpers::counter::Counter::Event"`` = "smartr::presets::helpers::counter::Counter::Event"; `type`: ``"event"`` = "event"; `variants`: readonly [\{ `kind`: ``"flat"`` = "flat"; `name`: ``"OwnableEvent"`` = "OwnableEvent"; `type`: ``"openzeppelin::access::ownable::ownable::OwnableComponent::Event"`` = "openzeppelin::access::ownable::ownable::OwnableComponent::Event" }, \{ `kind`: ``"flat"`` = "flat"; `name`: ``"UpgradeableEvent"`` = "UpgradeableEvent"; `type`: ``"openzeppelin::upgrades::upgradeable::UpgradeableComponent::Event"`` = "openzeppelin::upgrades::upgradeable::UpgradeableComponent::Event" }]  }]

#### Defined in

[sdks/starknet-test-helpers/src/abi/Counter.ts:1](https://github.com/0xknwn/starknet-modular-account/blob/b252147e67f1a93442e2234401250f5105244be9/sdks/starknet-test-helpers/src/abi/Counter.ts#L1)

___

### default\_timeout

• `Const` **default\_timeout**: ``120000``

#### Defined in

[sdks/starknet-test-helpers/src/parameters.ts:3](https://github.com/0xknwn/starknet-modular-account/blob/b252147e67f1a93442e2234401250f5105244be9/sdks/starknet-test-helpers/src/parameters.ts#L3)

___

### udcAddress

• `Const` **udcAddress**: `bigint`

The address of the UDC (Universal Deployer Contract) in the StarkNet network.

#### Defined in

[sdks/starknet-test-helpers/src/natives.ts:13](https://github.com/0xknwn/starknet-modular-account/blob/b252147e67f1a93442e2234401250f5105244be9/sdks/starknet-test-helpers/src/natives.ts#L13)

## Functions

### ETH

▸ **ETH**(`provider`): [`ERC20`](classes/ERC20.md)

/**
 * Represents an instance of the ETH contract.

#### Parameters

| Name | Type |
| :------ | :------ |
| `provider` | `Account` \| `RpcProvider` |

#### Returns

[`ERC20`](classes/ERC20.md)

#### Defined in

[sdks/starknet-test-helpers/src/natives.ts:30](https://github.com/0xknwn/starknet-modular-account/blob/b252147e67f1a93442e2234401250f5105244be9/sdks/starknet-test-helpers/src/natives.ts#L30)

___

### STRK

▸ **STRK**(`provider`): [`ERC20`](classes/ERC20.md)

Creates an instance of the STARK contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `provider` | `Account` \| `RpcProvider` | The RpcProvider or Account used to interact with the token |

#### Returns

[`ERC20`](classes/ERC20.md)

An instance of the STARK contract.

#### Defined in

[sdks/starknet-test-helpers/src/natives.ts:23](https://github.com/0xknwn/starknet-modular-account/blob/b252147e67f1a93442e2234401250f5105244be9/sdks/starknet-test-helpers/src/natives.ts#L23)

___

### accountAddress

▸ **accountAddress**(`accountName`, `publicKey`, `constructorCallData`): `string`

Calculates the account address for a given account name, public key, and constructor call data.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `accountName` | `string` | The name of the account used in this project. |
| `publicKey` | `string` | The public key associated with the account. |
| `constructorCallData` | `string`[] | The constructor call data for the account. |

#### Returns

`string`

The calculated account address.

**`Remarks`**

This function requires the cairo account to be compiled with the
`scarb build` command at the root of the project.

#### Defined in

[sdks/starknet-test-helpers/src/contract.ts:41](https://github.com/0xknwn/starknet-modular-account/blob/b252147e67f1a93442e2234401250f5105244be9/sdks/starknet-test-helpers/src/contract.ts#L41)

___

### classHash

▸ **classHash**(`className`): `string`

Computes the hash of the requested class that is part of the
0xknwn/starknet-modular-account project.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `className` | `string` | The name of the contract class. |

#### Returns

`string`

The hash of the contract class.

**`Remarks`**

This function requires the cairo contract to be compiled with the
`scarb build` command at the root of the project.

#### Defined in

[sdks/starknet-test-helpers/src/class.ts:19](https://github.com/0xknwn/starknet-modular-account/blob/b252147e67f1a93442e2234401250f5105244be9/sdks/starknet-test-helpers/src/class.ts#L19)

___

### config

▸ **config**(`env?`): [`Config`](modules.md#config)

Retrieves the configuration based on the specified environment.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `env` | `string` | `"devnet"` | The environment for which to retrieve the configuration. Defaults to "devnet". |

#### Returns

[`Config`](modules.md#config)

The configuration object.

#### Defined in

[sdks/starknet-test-helpers/src/utils.ts:33](https://github.com/0xknwn/starknet-modular-account/blob/b252147e67f1a93442e2234401250f5105244be9/sdks/starknet-test-helpers/src/utils.ts#L33)

___

### counterAddress

▸ **counterAddress**(`deployerAddress`, `ownerAddress`): `Promise`\<`string`\>

Retrieves the address of the Counter contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deployerAddress` | `string` | The address of the deployer. |
| `ownerAddress` | `string` | The address of the owner. |

#### Returns

`Promise`\<`string`\>

The address of the Counter contract.

#### Defined in

[sdks/starknet-test-helpers/src/counter.ts:11](https://github.com/0xknwn/starknet-modular-account/blob/b252147e67f1a93442e2234401250f5105244be9/sdks/starknet-test-helpers/src/counter.ts#L11)

___

### declareClass

▸ **declareClass**(`account`, `className?`): `Promise`\<\{ `classHash`: `string` = AccountClassHash } \| \{ `actual_fee`: \{ `amount`: `string` ; `unit`: ``"WEI"`` \| ``"FRI"``  } ; `block_hash`: `string` ; `block_number`: `number` ; `classHash`: `string` = declare.class\_hash; `events`: \{ `data`: `string`[] ; `from_address`: `string` ; `keys`: `string`[]  }[] ; `execution_resources`: \{ `bitwise_builtin_applications`: `undefined` \| `number` ; `data_availability`: `undefined` \| \{ `l1_data_gas`: `number` ; `l1_gas`: `number`  } ; `ec_op_builtin_applications`: `undefined` \| `number` ; `ecdsa_builtin_applications`: `undefined` \| `number` ; `keccak_builtin_applications`: `undefined` \| `number` ; `memory_holes`: `undefined` \| `number` ; `pedersen_builtin_applications`: `undefined` \| `number` ; `poseidon_builtin_applications`: `undefined` \| `number` ; `range_check_builtin_applications`: `undefined` \| `number` ; `segment_arena_builtin`: `undefined` \| `number` ; `steps`: `number`  } ; `execution_status`: ``"SUCCEEDED"`` \| ``"REVERTED"`` ; `finality_status`: ``"ACCEPTED_ON_L2"`` \| ``"ACCEPTED_ON_L1"`` ; `messages_sent`: \{ `from_address`: `string` ; `payload`: `string`[] ; `to_address`: `string`  }[] ; `revert_reason`: `undefined` \| `string` ; `statusReceipt`: keyof `TransactionStatusReceiptSets` ; `transaction_hash`: `string` ; `type`: ``"INVOKE"`` ; `value`: `TransactionReceiptValue`  } \| \{ `actual_fee`: \{ `amount`: `string` ; `unit`: ``"WEI"`` \| ``"FRI"``  } ; `classHash`: `string` = declare.class\_hash; `events`: \{ `data`: `string`[] ; `from_address`: `string` ; `keys`: `string`[]  }[] ; `execution_resources`: \{ `bitwise_builtin_applications`: `undefined` \| `number` ; `data_availability`: `undefined` \| \{ `l1_data_gas`: `number` ; `l1_gas`: `number`  } ; `ec_op_builtin_applications`: `undefined` \| `number` ; `ecdsa_builtin_applications`: `undefined` \| `number` ; `keccak_builtin_applications`: `undefined` \| `number` ; `memory_holes`: `undefined` \| `number` ; `pedersen_builtin_applications`: `undefined` \| `number` ; `poseidon_builtin_applications`: `undefined` \| `number` ; `range_check_builtin_applications`: `undefined` \| `number` ; `segment_arena_builtin`: `undefined` \| `number` ; `steps`: `number`  } ; `execution_status`: ``"SUCCEEDED"`` \| ``"REVERTED"`` ; `finality_status`: ``"ACCEPTED_ON_L2"`` \| ``"ACCEPTED_ON_L1"`` ; `messages_sent`: \{ `from_address`: `string` ; `payload`: `string`[] ; `to_address`: `string`  }[] ; `revert_reason`: `undefined` \| `string` ; `statusReceipt`: keyof `TransactionStatusReceiptSets` ; `transaction_hash`: `string` ; `type`: ``"INVOKE"`` ; `value`: `TransactionReceiptValue`  } \| \{ `actual_fee`: \{ `amount`: `string` ; `unit`: ``"WEI"`` \| ``"FRI"``  } ; `block_hash`: `string` ; `block_number`: `number` ; `classHash`: `string` = declare.class\_hash; `events`: \{ `data`: `string`[] ; `from_address`: `string` ; `keys`: `string`[]  }[] ; `execution_resources`: \{ `bitwise_builtin_applications`: `undefined` \| `number` ; `data_availability`: `undefined` \| \{ `l1_data_gas`: `number` ; `l1_gas`: `number`  } ; `ec_op_builtin_applications`: `undefined` \| `number` ; `ecdsa_builtin_applications`: `undefined` \| `number` ; `keccak_builtin_applications`: `undefined` \| `number` ; `memory_holes`: `undefined` \| `number` ; `pedersen_builtin_applications`: `undefined` \| `number` ; `poseidon_builtin_applications`: `undefined` \| `number` ; `range_check_builtin_applications`: `undefined` \| `number` ; `segment_arena_builtin`: `undefined` \| `number` ; `steps`: `number`  } ; `execution_status`: ``"SUCCEEDED"`` \| ``"REVERTED"`` ; `finality_status`: ``"ACCEPTED_ON_L2"`` \| ``"ACCEPTED_ON_L1"`` ; `messages_sent`: \{ `from_address`: `string` ; `payload`: `string`[] ; `to_address`: `string`  }[] ; `revert_reason`: `undefined` \| `string` ; `statusReceipt`: keyof `TransactionStatusReceiptSets` ; `transaction_hash`: `string` ; `type`: ``"DECLARE"`` ; `value`: `TransactionReceiptValue`  } \| \{ `actual_fee`: \{ `amount`: `string` ; `unit`: ``"WEI"`` \| ``"FRI"``  } ; `classHash`: `string` = declare.class\_hash; `events`: \{ `data`: `string`[] ; `from_address`: `string` ; `keys`: `string`[]  }[] ; `execution_resources`: \{ `bitwise_builtin_applications`: `undefined` \| `number` ; `data_availability`: `undefined` \| \{ `l1_data_gas`: `number` ; `l1_gas`: `number`  } ; `ec_op_builtin_applications`: `undefined` \| `number` ; `ecdsa_builtin_applications`: `undefined` \| `number` ; `keccak_builtin_applications`: `undefined` \| `number` ; `memory_holes`: `undefined` \| `number` ; `pedersen_builtin_applications`: `undefined` \| `number` ; `poseidon_builtin_applications`: `undefined` \| `number` ; `range_check_builtin_applications`: `undefined` \| `number` ; `segment_arena_builtin`: `undefined` \| `number` ; `steps`: `number`  } ; `execution_status`: ``"SUCCEEDED"`` \| ``"REVERTED"`` ; `finality_status`: ``"ACCEPTED_ON_L2"`` \| ``"ACCEPTED_ON_L1"`` ; `messages_sent`: \{ `from_address`: `string` ; `payload`: `string`[] ; `to_address`: `string`  }[] ; `revert_reason`: `undefined` \| `string` ; `statusReceipt`: keyof `TransactionStatusReceiptSets` ; `transaction_hash`: `string` ; `type`: ``"DECLARE"`` ; `value`: `TransactionReceiptValue`  } \| \{ `actual_fee`: `string` ; `block_hash?`: `string` ; `block_number?`: `BlockNumber` ; `classHash`: `string` = declare.class\_hash; `events`: `any`[] ; `execution_status`: `any` ; `finality_status`: `any` ; `messages_sent`: `MessageToL1`[] ; `revert_reason?`: `string` ; `status?`: `TransactionStatus` ; `statusReceipt`: keyof `TransactionStatusReceiptSets` ; `transaction_hash`: `string` ; `transaction_index?`: `number` ; `type?`: `any` ; `value`: `TransactionReceiptValue`  } \| \{ `classHash`: `string` = declare.class\_hash; `status`: ``"REJECTED"`` ; `statusReceipt`: keyof `TransactionStatusReceiptSets` ; `transaction_failure_reason`: \{ `code`: `string` ; `error_message`: `string`  } ; `value`: `TransactionReceiptValue`  }\>

If not already declared, declare the requested class from the
0xknwn/starknet-modular-account project to the Starknet network used by the
provided account.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `account` | `Account` | `undefined` | The starknet.js account used to declare the class. |
| `className` | `string` | `"SmartrAccount"` | The name of the class to declare. Defaults to "SmartrAccount". |

#### Returns

`Promise`\<\{ `classHash`: `string` = AccountClassHash } \| \{ `actual_fee`: \{ `amount`: `string` ; `unit`: ``"WEI"`` \| ``"FRI"``  } ; `block_hash`: `string` ; `block_number`: `number` ; `classHash`: `string` = declare.class\_hash; `events`: \{ `data`: `string`[] ; `from_address`: `string` ; `keys`: `string`[]  }[] ; `execution_resources`: \{ `bitwise_builtin_applications`: `undefined` \| `number` ; `data_availability`: `undefined` \| \{ `l1_data_gas`: `number` ; `l1_gas`: `number`  } ; `ec_op_builtin_applications`: `undefined` \| `number` ; `ecdsa_builtin_applications`: `undefined` \| `number` ; `keccak_builtin_applications`: `undefined` \| `number` ; `memory_holes`: `undefined` \| `number` ; `pedersen_builtin_applications`: `undefined` \| `number` ; `poseidon_builtin_applications`: `undefined` \| `number` ; `range_check_builtin_applications`: `undefined` \| `number` ; `segment_arena_builtin`: `undefined` \| `number` ; `steps`: `number`  } ; `execution_status`: ``"SUCCEEDED"`` \| ``"REVERTED"`` ; `finality_status`: ``"ACCEPTED_ON_L2"`` \| ``"ACCEPTED_ON_L1"`` ; `messages_sent`: \{ `from_address`: `string` ; `payload`: `string`[] ; `to_address`: `string`  }[] ; `revert_reason`: `undefined` \| `string` ; `statusReceipt`: keyof `TransactionStatusReceiptSets` ; `transaction_hash`: `string` ; `type`: ``"INVOKE"`` ; `value`: `TransactionReceiptValue`  } \| \{ `actual_fee`: \{ `amount`: `string` ; `unit`: ``"WEI"`` \| ``"FRI"``  } ; `classHash`: `string` = declare.class\_hash; `events`: \{ `data`: `string`[] ; `from_address`: `string` ; `keys`: `string`[]  }[] ; `execution_resources`: \{ `bitwise_builtin_applications`: `undefined` \| `number` ; `data_availability`: `undefined` \| \{ `l1_data_gas`: `number` ; `l1_gas`: `number`  } ; `ec_op_builtin_applications`: `undefined` \| `number` ; `ecdsa_builtin_applications`: `undefined` \| `number` ; `keccak_builtin_applications`: `undefined` \| `number` ; `memory_holes`: `undefined` \| `number` ; `pedersen_builtin_applications`: `undefined` \| `number` ; `poseidon_builtin_applications`: `undefined` \| `number` ; `range_check_builtin_applications`: `undefined` \| `number` ; `segment_arena_builtin`: `undefined` \| `number` ; `steps`: `number`  } ; `execution_status`: ``"SUCCEEDED"`` \| ``"REVERTED"`` ; `finality_status`: ``"ACCEPTED_ON_L2"`` \| ``"ACCEPTED_ON_L1"`` ; `messages_sent`: \{ `from_address`: `string` ; `payload`: `string`[] ; `to_address`: `string`  }[] ; `revert_reason`: `undefined` \| `string` ; `statusReceipt`: keyof `TransactionStatusReceiptSets` ; `transaction_hash`: `string` ; `type`: ``"INVOKE"`` ; `value`: `TransactionReceiptValue`  } \| \{ `actual_fee`: \{ `amount`: `string` ; `unit`: ``"WEI"`` \| ``"FRI"``  } ; `block_hash`: `string` ; `block_number`: `number` ; `classHash`: `string` = declare.class\_hash; `events`: \{ `data`: `string`[] ; `from_address`: `string` ; `keys`: `string`[]  }[] ; `execution_resources`: \{ `bitwise_builtin_applications`: `undefined` \| `number` ; `data_availability`: `undefined` \| \{ `l1_data_gas`: `number` ; `l1_gas`: `number`  } ; `ec_op_builtin_applications`: `undefined` \| `number` ; `ecdsa_builtin_applications`: `undefined` \| `number` ; `keccak_builtin_applications`: `undefined` \| `number` ; `memory_holes`: `undefined` \| `number` ; `pedersen_builtin_applications`: `undefined` \| `number` ; `poseidon_builtin_applications`: `undefined` \| `number` ; `range_check_builtin_applications`: `undefined` \| `number` ; `segment_arena_builtin`: `undefined` \| `number` ; `steps`: `number`  } ; `execution_status`: ``"SUCCEEDED"`` \| ``"REVERTED"`` ; `finality_status`: ``"ACCEPTED_ON_L2"`` \| ``"ACCEPTED_ON_L1"`` ; `messages_sent`: \{ `from_address`: `string` ; `payload`: `string`[] ; `to_address`: `string`  }[] ; `revert_reason`: `undefined` \| `string` ; `statusReceipt`: keyof `TransactionStatusReceiptSets` ; `transaction_hash`: `string` ; `type`: ``"DECLARE"`` ; `value`: `TransactionReceiptValue`  } \| \{ `actual_fee`: \{ `amount`: `string` ; `unit`: ``"WEI"`` \| ``"FRI"``  } ; `classHash`: `string` = declare.class\_hash; `events`: \{ `data`: `string`[] ; `from_address`: `string` ; `keys`: `string`[]  }[] ; `execution_resources`: \{ `bitwise_builtin_applications`: `undefined` \| `number` ; `data_availability`: `undefined` \| \{ `l1_data_gas`: `number` ; `l1_gas`: `number`  } ; `ec_op_builtin_applications`: `undefined` \| `number` ; `ecdsa_builtin_applications`: `undefined` \| `number` ; `keccak_builtin_applications`: `undefined` \| `number` ; `memory_holes`: `undefined` \| `number` ; `pedersen_builtin_applications`: `undefined` \| `number` ; `poseidon_builtin_applications`: `undefined` \| `number` ; `range_check_builtin_applications`: `undefined` \| `number` ; `segment_arena_builtin`: `undefined` \| `number` ; `steps`: `number`  } ; `execution_status`: ``"SUCCEEDED"`` \| ``"REVERTED"`` ; `finality_status`: ``"ACCEPTED_ON_L2"`` \| ``"ACCEPTED_ON_L1"`` ; `messages_sent`: \{ `from_address`: `string` ; `payload`: `string`[] ; `to_address`: `string`  }[] ; `revert_reason`: `undefined` \| `string` ; `statusReceipt`: keyof `TransactionStatusReceiptSets` ; `transaction_hash`: `string` ; `type`: ``"DECLARE"`` ; `value`: `TransactionReceiptValue`  } \| \{ `actual_fee`: `string` ; `block_hash?`: `string` ; `block_number?`: `BlockNumber` ; `classHash`: `string` = declare.class\_hash; `events`: `any`[] ; `execution_status`: `any` ; `finality_status`: `any` ; `messages_sent`: `MessageToL1`[] ; `revert_reason?`: `string` ; `status?`: `TransactionStatus` ; `statusReceipt`: keyof `TransactionStatusReceiptSets` ; `transaction_hash`: `string` ; `transaction_index?`: `number` ; `type?`: `any` ; `value`: `TransactionReceiptValue`  } \| \{ `classHash`: `string` = declare.class\_hash; `status`: ``"REJECTED"`` ; `statusReceipt`: keyof `TransactionStatusReceiptSets` ; `transaction_failure_reason`: \{ `code`: `string` ; `error_message`: `string`  } ; `value`: `TransactionReceiptValue`  }\>

An object containing the declared class hash and the transaction
receipt if the class was not already declared.

**`Throws`**

An error if the class deployment fails.

**`Remarks`**

This function requires the cairo contract to be compiled with the
`scarb build` command at the root of the project. It also requires the
account to have enough funds to declare the class to the Starknet network.

#### Defined in

[sdks/starknet-test-helpers/src/class.ts:41](https://github.com/0xknwn/starknet-modular-account/blob/b252147e67f1a93442e2234401250f5105244be9/sdks/starknet-test-helpers/src/class.ts#L41)

___

### deployAccount

▸ **deployAccount**(`deployerAccount`, `accountName`, `publicKey`, `constructorCalldata`): `Promise`\<`string`\>

Deploys an account on the StarkNet network.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deployerAccount` | `Account` | The account used to deploy the new account. |
| `accountName` | `string` | The name of the account to be deployed. |
| `publicKey` | `string` | The public key associated with the account. |
| `constructorCalldata` | `any`[] | The constructor calldata required for deploying the account. |

#### Returns

`Promise`\<`string`\>

The address of the deployed account.

**`Throws`**

Error if the deployment fails.

#### Defined in

[sdks/starknet-test-helpers/src/contract.ts:107](https://github.com/0xknwn/starknet-modular-account/blob/b252147e67f1a93442e2234401250f5105244be9/sdks/starknet-test-helpers/src/contract.ts#L107)

___

### deployCounter

▸ **deployCounter**(`ownerAccount`, `ownerAddress`): `Promise`\<`Contract`\>

Deploys a Counter contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ownerAccount` | `Account` | The owner's account. |
| `ownerAddress` | `string` | The owner's address. |

#### Returns

`Promise`\<`Contract`\>

A Promise that resolves to the deployed Counter contract.

#### Defined in

[sdks/starknet-test-helpers/src/counter.ts:28](https://github.com/0xknwn/starknet-modular-account/blob/b252147e67f1a93442e2234401250f5105244be9/sdks/starknet-test-helpers/src/counter.ts#L28)

___

### deploySimpleAccount

▸ **deploySimpleAccount**(`deployerAccount`, `publicKey`, `more`): `Promise`\<`string`\>

Deploys a simple account on the StarkNet network.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deployerAccount` | `Account` | The account used to deploy the simple account. |
| `publicKey` | `string` | The public key associated with the simple account. |
| `more` | `string` | Additional information for the simple account. |

#### Returns

`Promise`\<`string`\>

A promise that resolves to the deployed simple account.

#### Defined in

[sdks/starknet-test-helpers/src/simple_account.ts:33](https://github.com/0xknwn/starknet-modular-account/blob/b252147e67f1a93442e2234401250f5105244be9/sdks/starknet-test-helpers/src/simple_account.ts#L33)

___

### deploySwapRouter

▸ **deploySwapRouter**(`deployerAccount`, `ownerAddress`): `Promise`\<`Contract`\>

Deploys the SwapRouter contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deployerAccount` | `Account` | The deployer account. |
| `ownerAddress` | `string` | The owner address. |

#### Returns

`Promise`\<`Contract`\>

A Promise that resolves to the deployed Counter contract.

#### Defined in

[sdks/starknet-test-helpers/src/swap_router.ts:29](https://github.com/0xknwn/starknet-modular-account/blob/b252147e67f1a93442e2234401250f5105244be9/sdks/starknet-test-helpers/src/swap_router.ts#L29)

___

### deployTokenA

▸ **deployTokenA**(`deployerAccount`, `recipientAddress`, `ownerAddress`): `Promise`\<`Contract`\>

Deploys the TokenA contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deployerAccount` | `Account` | The deployer account. |
| `recipientAddress` | `string` | - |
| `ownerAddress` | `string` | The owner address. |

#### Returns

`Promise`\<`Contract`\>

A Promise that resolves to the deployed Counter contract.

#### Defined in

[sdks/starknet-test-helpers/src/tokens.ts:71](https://github.com/0xknwn/starknet-modular-account/blob/b252147e67f1a93442e2234401250f5105244be9/sdks/starknet-test-helpers/src/tokens.ts#L71)

___

### deployTokenB

▸ **deployTokenB**(`deployerAccount`, `recipientAddress`, `ownerAddress`): `Promise`\<`Contract`\>

Deploys the TokenB contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deployerAccount` | `Account` | The deployer account. |
| `recipientAddress` | `string` | - |
| `ownerAddress` | `string` | The owner address. |

#### Returns

`Promise`\<`Contract`\>

A Promise that resolves to the deployed Counter contract.

#### Defined in

[sdks/starknet-test-helpers/src/tokens.ts:105](https://github.com/0xknwn/starknet-modular-account/blob/b252147e67f1a93442e2234401250f5105244be9/sdks/starknet-test-helpers/src/tokens.ts#L105)

___

### simpleAccountAddress

▸ **simpleAccountAddress**(`publicKey`, `more`): `string`

Generates a simple account address based on the provided public key and
additional data.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `publicKey` | `string` | The public key associated with the account. |
| `more` | `string` | Additional data for the account. |

#### Returns

`string`

The generated account address.

#### Defined in

[sdks/starknet-test-helpers/src/simple_account.ts:14](https://github.com/0xknwn/starknet-modular-account/blob/b252147e67f1a93442e2234401250f5105244be9/sdks/starknet-test-helpers/src/simple_account.ts#L14)

___

### swapRouterAddress

▸ **swapRouterAddress**(`deployerAddress`, `ownerAddress`): `Promise`\<`string`\>

Retrieves the swap router address from its deployer and owner.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deployerAddress` | `string` | The address of the deployer. |
| `ownerAddress` | `string` | The address of the owner. |

#### Returns

`Promise`\<`string`\>

The address of the swap router contract.

#### Defined in

[sdks/starknet-test-helpers/src/swap_router.ts:12](https://github.com/0xknwn/starknet-modular-account/blob/b252147e67f1a93442e2234401250f5105244be9/sdks/starknet-test-helpers/src/swap_router.ts#L12)

___

### testAccounts

▸ **testAccounts**(`config`): `Account`[]

Retrieves the Accounts from the configuration.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `config` | [`Config`](modules.md#config) | The configuration object containing the provider URL and account details. |

#### Returns

`Account`[]

An array of Accounts.

#### Defined in

[sdks/starknet-test-helpers/src/utils.ts:42](https://github.com/0xknwn/starknet-modular-account/blob/b252147e67f1a93442e2234401250f5105244be9/sdks/starknet-test-helpers/src/utils.ts#L42)

___

### tokenAAddress

▸ **tokenAAddress**(`deployerAddress`, `recipientAddress`, `ownerAddress`): `Promise`\<`string`\>

Retrieves the token A address.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deployerAddress` | `string` | The address of the deployer. |
| `recipientAddress` | `string` | The address of the recipient. |
| `ownerAddress` | `string` | The address of the owner. |

#### Returns

`Promise`\<`string`\>

The token A address.

#### Defined in

[sdks/starknet-test-helpers/src/tokens.ts:58](https://github.com/0xknwn/starknet-modular-account/blob/b252147e67f1a93442e2234401250f5105244be9/sdks/starknet-test-helpers/src/tokens.ts#L58)

___

### tokenBAddress

▸ **tokenBAddress**(`deployerAddress`, `recipientAddress`, `ownerAddress`): `Promise`\<`string`\>

Retrieves the token B address.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deployerAddress` | `string` | The address of the deployer. |
| `recipientAddress` | `string` | The address of the recipient. |
| `ownerAddress` | `string` | The address of the owner. |

#### Returns

`Promise`\<`string`\>

The token B address.

#### Defined in

[sdks/starknet-test-helpers/src/tokens.ts:92](https://github.com/0xknwn/starknet-modular-account/blob/b252147e67f1a93442e2234401250f5105244be9/sdks/starknet-test-helpers/src/tokens.ts#L92)
