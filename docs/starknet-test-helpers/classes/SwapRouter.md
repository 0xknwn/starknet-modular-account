[starknet-test-helpers](../README.md) / [Exports](../modules.md) / SwapRouter

# Class: SwapRouter

Represents a Swap contract.

## Hierarchy

- `Contract`

  ↳ **`SwapRouter`**

## Table of contents

### Constructors

- [constructor](SwapRouter.md#constructor)

### Properties

- [abi](SwapRouter.md#abi)
- [address](SwapRouter.md#address)
- [callStatic](SwapRouter.md#callstatic)
- [deployTransactionHash](SwapRouter.md#deploytransactionhash)
- [estimateFee](SwapRouter.md#estimatefee)
- [events](SwapRouter.md#events)
- [functions](SwapRouter.md#functions)
- [populateTransaction](SwapRouter.md#populatetransaction)
- [providerOrAccount](SwapRouter.md#provideroraccount)
- [structs](SwapRouter.md#structs)

### Methods

- [attach](SwapRouter.md#attach)
- [call](SwapRouter.md#call)
- [connect](SwapRouter.md#connect)
- [deployed](SwapRouter.md#deployed)
- [estimate](SwapRouter.md#estimate)
- [faucet](SwapRouter.md#faucet)
- [getVersion](SwapRouter.md#getversion)
- [get\_conversion\_rate](SwapRouter.md#get_conversion_rate)
- [invoke](SwapRouter.md#invoke)
- [isCairo1](SwapRouter.md#iscairo1)
- [parseEvents](SwapRouter.md#parseevents)
- [populate](SwapRouter.md#populate)
- [set\_conversion\_rate](SwapRouter.md#set_conversion_rate)
- [set\_tokens](SwapRouter.md#set_tokens)
- [swap](SwapRouter.md#swap)
- [swap\_maximum\_at](SwapRouter.md#swap_maximum_at)
- [swap\_minimum\_at](SwapRouter.md#swap_minimum_at)
- [typedv2](SwapRouter.md#typedv2)

## Constructors

### constructor

• **new SwapRouter**(`address`, `account`): [`SwapRouter`](SwapRouter.md)

Creates an instance of the Counter contract.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `address` | `string` | The address of the contract. |
| `account` | `Account` | The account used to interact with the contract. |

#### Returns

[`SwapRouter`](SwapRouter.md)

#### Overrides

Contract.constructor

#### Defined in

[sdks/starknet-test-helpers/src/swap_router.ts:54](https://github.com/0xknwn/starknet-modular-account/blob/6c1c42749806d20a09515e40349c95b942b62ed6/sdks/starknet-test-helpers/src/swap_router.ts#L54)

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

### faucet

▸ **faucet**(`amount`): `Promise`\<`GetTransactionReceiptResponse`\>

Sends a request to the faucet to receive a specified amount of Token A.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `amount` | `Uint256` | The amount of tokens to request from the faucet. |

#### Returns

`Promise`\<`GetTransactionReceiptResponse`\>

A promise that resolves to the transaction receipt once the transfer is complete.

#### Defined in

[sdks/starknet-test-helpers/src/swap_router.ts:63](https://github.com/0xknwn/starknet-modular-account/blob/6c1c42749806d20a09515e40349c95b942b62ed6/sdks/starknet-test-helpers/src/swap_router.ts#L63)

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

### get\_conversion\_rate

▸ **get_conversion_rate**(): `Promise`\<`bigint`\>

Retrieves the conversion rate.

#### Returns

`Promise`\<`bigint`\>

A promise that resolves to a bigint representing the conversion rate.

#### Defined in

[sdks/starknet-test-helpers/src/swap_router.ts:107](https://github.com/0xknwn/starknet-modular-account/blob/6c1c42749806d20a09515e40349c95b942b62ed6/sdks/starknet-test-helpers/src/swap_router.ts#L107)

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

### set\_conversion\_rate

▸ **set_conversion_rate**(`rate`): `Promise`\<`GetTransactionReceiptResponse`\>

Sets the conversion rate for the swap router.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `rate` | `string` | The conversion rate to be set. |

#### Returns

`Promise`\<`GetTransactionReceiptResponse`\>

A promise that resolves to the transaction receipt once the conversion rate is set.

#### Defined in

[sdks/starknet-test-helpers/src/swap_router.ts:94](https://github.com/0xknwn/starknet-modular-account/blob/6c1c42749806d20a09515e40349c95b942b62ed6/sdks/starknet-test-helpers/src/swap_router.ts#L94)

___

### set\_tokens

▸ **set_tokens**(`tokenAAddress`, `tokenBAddress`): `Promise`\<`GetTransactionReceiptResponse`\>

Sets the token addresses for tokenA and tokenB.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenAAddress` | `string` | The address of tokenA. |
| `tokenBAddress` | `string` | The address of tokenB. |

#### Returns

`Promise`\<`GetTransactionReceiptResponse`\>

A promise that resolves to the transaction receipt once the transaction is confirmed.

#### Defined in

[sdks/starknet-test-helpers/src/swap_router.ts:79](https://github.com/0xknwn/starknet-modular-account/blob/6c1c42749806d20a09515e40349c95b942b62ed6/sdks/starknet-test-helpers/src/swap_router.ts#L79)

___

### swap

▸ **swap**(`tokenAAddress`, `amount`): `Promise`\<`GetTransactionReceiptResponse`\>

Swaps a specified amount of a token for another token.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenAAddress` | `string` | The address of the token to be swapped. |
| `amount` | `Uint256` | The amount of the token to be swapped. |

#### Returns

`Promise`\<`GetTransactionReceiptResponse`\>

A promise that resolves to the transaction receipt once the swap is completed.

#### Defined in

[sdks/starknet-test-helpers/src/swap_router.ts:117](https://github.com/0xknwn/starknet-modular-account/blob/6c1c42749806d20a09515e40349c95b942b62ed6/sdks/starknet-test-helpers/src/swap_router.ts#L117)

___

### swap\_maximum\_at

▸ **swap_maximum_at**(`tokenAAddress`, `rate`, `amount`): `Promise`\<`GetTransactionReceiptResponse`\>

Swaps the maximum amount of tokens at a given rate.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenAAddress` | `string` | The address of the token A. |
| `rate` | `string` | The rate at which to swap the tokens. |
| `amount` | `Uint256` | The amount of tokens to swap. |

#### Returns

`Promise`\<`GetTransactionReceiptResponse`\>

A promise that resolves to the transaction receipt of the swap.

#### Defined in

[sdks/starknet-test-helpers/src/swap_router.ts:168](https://github.com/0xknwn/starknet-modular-account/blob/6c1c42749806d20a09515e40349c95b942b62ed6/sdks/starknet-test-helpers/src/swap_router.ts#L168)

___

### swap\_minimum\_at

▸ **swap_minimum_at**(`tokenAAddress`, `rate`, `amount`): `Promise`\<`GetTransactionReceiptResponse`\>

Executes a swap with a minimum rate and amount.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `tokenAAddress` | `string` | The address of the token A. |
| `rate` | `string` | The rate of the swap. |
| `amount` | `Uint256` | The amount to swap. |

#### Returns

`Promise`\<`GetTransactionReceiptResponse`\>

A promise that resolves to the transaction receipt of the swap.

#### Defined in

[sdks/starknet-test-helpers/src/swap_router.ts:142](https://github.com/0xknwn/starknet-modular-account/blob/6c1c42749806d20a09515e40349c95b942b62ed6/sdks/starknet-test-helpers/src/swap_router.ts#L142)

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
