[starknet-test-helpers](../README.md) / [Exports](../modules.md) / Counter

# Class: Counter

Represents a Counter contract.

## Hierarchy

- `Contract`

  ↳ **`Counter`**

## Table of contents

### Constructors

- [constructor](Counter.md#constructor)

### Properties

- [abi](Counter.md#abi)
- [address](Counter.md#address)
- [callStatic](Counter.md#callstatic)
- [deployTransactionHash](Counter.md#deploytransactionhash)
- [estimateFee](Counter.md#estimatefee)
- [events](Counter.md#events)
- [functions](Counter.md#functions)
- [populateTransaction](Counter.md#populatetransaction)
- [providerOrAccount](Counter.md#provideroraccount)
- [structs](Counter.md#structs)

### Methods

- [attach](Counter.md#attach)
- [call](Counter.md#call)
- [connect](Counter.md#connect)
- [deployed](Counter.md#deployed)
- [estimate](Counter.md#estimate)
- [get](Counter.md#get)
- [getVersion](Counter.md#getversion)
- [increment](Counter.md#increment)
- [increment\_by](Counter.md#increment_by)
- [increment\_by\_array](Counter.md#increment_by_array)
- [increment\_by\_multicall](Counter.md#increment_by_multicall)
- [invoke](Counter.md#invoke)
- [isCairo1](Counter.md#iscairo1)
- [parseEvents](Counter.md#parseevents)
- [populate](Counter.md#populate)
- [reset](Counter.md#reset)
- [typedv2](Counter.md#typedv2)

## Constructors

### constructor

• **new Counter**(`address`, `account`): [`Counter`](Counter.md)

Creates an instance of the Counter contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `address` | `string` | The address of the contract. |
| `account` | `Account` | The account used to interact with the contract. |

#### Returns

[`Counter`](Counter.md)

#### Overrides

Contract.constructor

#### Defined in

[sdks/starknet-test-helpers/src/counter.ts:50](https://github.com/0xknwn/starknet-modular-account/blob/840a6dafe49b1873f6605b7b75762738f0785693/sdks/starknet-test-helpers/src/counter.ts#L50)

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

### get

▸ **get**(): `Promise`\<`bigint`\>

Gets the current value of the counter.

#### Returns

`Promise`\<`bigint`\>

A promise that contains the counter value.

#### Defined in

[sdks/starknet-test-helpers/src/counter.ts:117](https://github.com/0xknwn/starknet-modular-account/blob/840a6dafe49b1873f6605b7b75762738f0785693/sdks/starknet-test-helpers/src/counter.ts#L117)

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

### increment

▸ **increment**(): `Promise`\<`any`\>

Increments the counter by 1.

#### Returns

`Promise`\<`any`\>

A promise that resolves to the result of the execution.

#### Defined in

[sdks/starknet-test-helpers/src/counter.ts:58](https://github.com/0xknwn/starknet-modular-account/blob/840a6dafe49b1873f6605b7b75762738f0785693/sdks/starknet-test-helpers/src/counter.ts#L58)

___

### increment\_by

▸ **increment_by**(`value`): `Promise`\<`any`\>

Increments the counter by the specified value.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `number` | The value to increment the counter by. |

#### Returns

`Promise`\<`any`\>

A promise that resolves to the result of the execution.

#### Defined in

[sdks/starknet-test-helpers/src/counter.ts:68](https://github.com/0xknwn/starknet-modular-account/blob/840a6dafe49b1873f6605b7b75762738f0785693/sdks/starknet-test-helpers/src/counter.ts#L68)

___

### increment\_by\_array

▸ **increment_by_array**(`args`): `Promise`\<`any`\>

Increments the counter by an array of numbers using increment_by_array.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | `number`[] | The array of values to increment the counter by. |

#### Returns

`Promise`\<`any`\>

A promise that resolves to the result of the execution.

#### Defined in

[sdks/starknet-test-helpers/src/counter.ts:95](https://github.com/0xknwn/starknet-modular-account/blob/840a6dafe49b1873f6605b7b75762738f0785693/sdks/starknet-test-helpers/src/counter.ts#L95)

___

### increment\_by\_multicall

▸ **increment_by_multicall**(`values`): `Promise`\<`any`\>

Increments the counter by an array of numbers using a multicall of increment_by.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `values` | `number`[] | The array of values to increment the counter by. |

#### Returns

`Promise`\<`any`\>

A promise that resolves to the result of the execution.

#### Defined in

[sdks/starknet-test-helpers/src/counter.ts:78](https://github.com/0xknwn/starknet-modular-account/blob/840a6dafe49b1873f6605b7b75762738f0785693/sdks/starknet-test-helpers/src/counter.ts#L78)

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

### reset

▸ **reset**(): `Promise`\<`any`\>

Resets the counter.

#### Returns

`Promise`\<`any`\>

A promise that resolves to the result of the execution.

**`Remarks`**

This function requires the Account used by the Counter to be its owner.

#### Defined in

[sdks/starknet-test-helpers/src/counter.ts:108](https://github.com/0xknwn/starknet-modular-account/blob/840a6dafe49b1873f6605b7b75762738f0785693/sdks/starknet-test-helpers/src/counter.ts#L108)

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
