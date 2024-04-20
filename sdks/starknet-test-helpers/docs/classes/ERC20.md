[starknet-test-helpers](../README.md) / [Exports](../modules.md) / ERC20

# Class: ERC20

Represents an instance of the ERC20 contract.

## Hierarchy

- `Contract`

  ↳ **`ERC20`**

## Table of contents

### Constructors

- [constructor](ERC20.md#constructor)

### Properties

- [abi](ERC20.md#abi)
- [address](ERC20.md#address)
- [callStatic](ERC20.md#callstatic)
- [deployTransactionHash](ERC20.md#deploytransactionhash)
- [estimateFee](ERC20.md#estimatefee)
- [events](ERC20.md#events)
- [functions](ERC20.md#functions)
- [populateTransaction](ERC20.md#populatetransaction)
- [providerOrAccount](ERC20.md#provideroraccount)
- [structs](ERC20.md#structs)

### Methods

- [attach](ERC20.md#attach)
- [balanceOf](ERC20.md#balanceof)
- [call](ERC20.md#call)
- [connect](ERC20.md#connect)
- [deployed](ERC20.md#deployed)
- [estimate](ERC20.md#estimate)
- [getVersion](ERC20.md#getversion)
- [invoke](ERC20.md#invoke)
- [isCairo1](ERC20.md#iscairo1)
- [parseEvents](ERC20.md#parseevents)
- [populate](ERC20.md#populate)
- [transfer](ERC20.md#transfer)
- [typedv2](ERC20.md#typedv2)

## Constructors

### constructor

• **new ERC20**(`address`, `provider`): [`ERC20`](ERC20.md)

Constructs a new instance of the `Token` class.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `address` | `string` | The address pf the token. |
| `provider` | `Account` \| `RpcProvider` | The RPC provider or account to use for interacting with the contract. |

#### Returns

[`ERC20`](ERC20.md)

#### Overrides

Contract.constructor

#### Defined in

[sdks/starknet-test-helpers/src/tokens.ts:19](https://github.com/0xknwn/starknet-modular-account/blob/840a6dafe49b1873f6605b7b75762738f0785693/sdks/starknet-test-helpers/src/tokens.ts#L19)

## Properties

### abi

• **abi**: `Abi`

#### Inherited from

Contract.abi

#### Defined in

node_modules/starknet/dist/index.d.ts:4737

___

### address

• **address**: `string`

#### Inherited from

Contract.address

#### Defined in

node_modules/starknet/dist/index.d.ts:4738

___

### callStatic

• `Readonly` **callStatic**: `Object`

#### Index signature

▪ [name: `string`]: `AsyncContractFunction`

#### Inherited from

Contract.callStatic

#### Defined in

node_modules/starknet/dist/index.d.ts:4748

___

### deployTransactionHash

• `Optional` **deployTransactionHash**: `string`

#### Inherited from

Contract.deployTransactionHash

#### Defined in

node_modules/starknet/dist/index.d.ts:4740

___

### estimateFee

• `Readonly` **estimateFee**: `Object`

#### Index signature

▪ [name: `string`]: `ContractFunction`

#### Inherited from

Contract.estimateFee

#### Defined in

node_modules/starknet/dist/index.d.ts:4754

___

### events

• `Protected` `Readonly` **events**: `AbiEvents`

#### Inherited from

Contract.events

#### Defined in

node_modules/starknet/dist/index.d.ts:4744

___

### functions

• `Readonly` **functions**: `Object`

#### Index signature

▪ [name: `string`]: `AsyncContractFunction`

#### Inherited from

Contract.functions

#### Defined in

node_modules/starknet/dist/index.d.ts:4745

___

### populateTransaction

• `Readonly` **populateTransaction**: `Object`

#### Index signature

▪ [name: `string`]: `ContractFunction`

#### Inherited from

Contract.populateTransaction

#### Defined in

node_modules/starknet/dist/index.d.ts:4751

___

### providerOrAccount

• **providerOrAccount**: `ProviderInterface` \| `AccountInterface`

#### Inherited from

Contract.providerOrAccount

#### Defined in

node_modules/starknet/dist/index.d.ts:4739

___

### structs

• `Protected` `Readonly` **structs**: `Object`

#### Index signature

▪ [name: `string`]: `StructAbi`

#### Inherited from

Contract.structs

#### Defined in

node_modules/starknet/dist/index.d.ts:4741

## Methods

### attach

▸ **attach**(`address`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `address` | `string` |

#### Returns

`void`

#### Inherited from

Contract.attach

#### Defined in

node_modules/starknet/dist/index.d.ts:4767

___

### balanceOf

▸ **balanceOf**(`address`): `Promise`\<`bigint`\>

Retrieves the balance of the specified address.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `address` | `string` | The address to retrieve the balance for. |

#### Returns

`Promise`\<`bigint`\>

A promise that resolves to the balance of the address as a bigint.

#### Defined in

[sdks/starknet-test-helpers/src/tokens.ts:28](https://github.com/0xknwn/starknet-modular-account/blob/840a6dafe49b1873f6605b7b75762738f0785693/sdks/starknet-test-helpers/src/tokens.ts#L28)

___

### call

▸ **call**(`method`, `args?`, `«destructured»?`): `Promise`\<`Result`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `method` | `string` |
| `args?` | `ArgsOrCalldata` |
| `«destructured»` | `CallOptions` |

#### Returns

`Promise`\<`Result`\>

#### Inherited from

Contract.call

#### Defined in

node_modules/starknet/dist/index.d.ts:4770

___

### connect

▸ **connect**(`providerOrAccount`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `providerOrAccount` | `ProviderInterface` \| `AccountInterface` |

#### Returns

`void`

#### Inherited from

Contract.connect

#### Defined in

node_modules/starknet/dist/index.d.ts:4768

___

### deployed

▸ **deployed**(): `Promise`\<`Contract`\>

#### Returns

`Promise`\<`Contract`\>

#### Inherited from

Contract.deployed

#### Defined in

node_modules/starknet/dist/index.d.ts:4769

___

### estimate

▸ **estimate**(`method`, `args?`): `Promise`\<`EstimateFeeResponse`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `method` | `string` |
| `args?` | `ArgsOrCalldata` |

#### Returns

`Promise`\<`EstimateFeeResponse`\>

#### Inherited from

Contract.estimate

#### Defined in

node_modules/starknet/dist/index.d.ts:4772

___

### getVersion

▸ **getVersion**(): `Promise`\<`ContractVersion`\>

#### Returns

`Promise`\<`ContractVersion`\>

#### Inherited from

Contract.getVersion

#### Defined in

node_modules/starknet/dist/index.d.ts:4776

___

### invoke

▸ **invoke**(`method`, `args?`, `«destructured»?`): `Promise`\<\{ `transaction_hash`: `string`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `method` | `string` |
| `args?` | `ArgsOrCalldata` |
| `«destructured»` | `InvokeOptions` |

#### Returns

`Promise`\<\{ `transaction_hash`: `string`  }\>

#### Inherited from

Contract.invoke

#### Defined in

node_modules/starknet/dist/index.d.ts:4771

___

### isCairo1

▸ **isCairo1**(): `boolean`

#### Returns

`boolean`

#### Inherited from

Contract.isCairo1

#### Defined in

node_modules/starknet/dist/index.d.ts:4775

___

### parseEvents

▸ **parseEvents**(`receipt`): `ParsedEvents`

#### Parameters

| Name | Type |
| :------ | :------ |
| `receipt` | `GetTransactionReceiptResponse` |

#### Returns

`ParsedEvents`

#### Inherited from

Contract.parseEvents

#### Defined in

node_modules/starknet/dist/index.d.ts:4774

___

### populate

▸ **populate**(`method`, `args?`): `Call`

#### Parameters

| Name | Type |
| :------ | :------ |
| `method` | `string` |
| `args?` | `RawArgs` |

#### Returns

`Call`

#### Inherited from

Contract.populate

#### Defined in

node_modules/starknet/dist/index.d.ts:4773

___

### transfer

▸ **transfer**(`recipient`, `amount`): `Promise`\<\{ `transaction_hash`: `string`  }\>

Transfers a specified amount of tokens to the given address.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `recipient` | `string` | The address to which the tokens will be transferred. |
| `amount` | `Uint256` | The amount of tokens to transfer. |

#### Returns

`Promise`\<\{ `transaction_hash`: `string`  }\>

**`Throws`**

- Throws an error when interacting with a RpcProvider and
not an Account.

#### Defined in

[sdks/starknet-test-helpers/src/tokens.ts:40](https://github.com/0xknwn/starknet-modular-account/blob/840a6dafe49b1873f6605b7b75762738f0785693/sdks/starknet-test-helpers/src/tokens.ts#L40)

___

### typedv2

▸ **typedv2**\<`TAbi`\>(`tAbi`): `TypedContractV2`\<`TAbi`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TAbi` | extends readonly (`AbiImpl` \| `AbiInterface` \| `AbiConstructor` \| `AbiFunction` \| `AbiStruct` \| `AbiEnum` \| `AbiEvent`)[] |

#### Parameters

| Name | Type |
| :------ | :------ |
| `tAbi` | `TAbi` |

#### Returns

`TypedContractV2`\<`TAbi`\>

#### Inherited from

Contract.typedv2

#### Defined in

node_modules/starknet/dist/index.d.ts:4777
