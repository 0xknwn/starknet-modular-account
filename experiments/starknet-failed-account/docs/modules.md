[starknet-failed-account](README.md) / Exports

# starknet-failed-account

## Table of contents

### Functions

- [deployFailedAccount](modules.md#deployfailedaccount)
- [failedAccountAddress](modules.md#failedaccountaddress)

## Functions

### deployFailedAccount

▸ **deployFailedAccount**(`deployerAccount`, `publicKey`): `Promise`\<`string`\>

Deploys a failing account on the StarkNet network.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `deployerAccount` | `Account` | The account used to deploy the simple account. |
| `publicKey` | `string` | The public key associated with the simple account. |

#### Returns

`Promise`\<`string`\>

A promise that resolves to the deployed simple account.

#### Defined in

[failed_account.ts:24](https://github.com/0xknwn/starknet-modular-account/blob/c2960301b1b70ffa10998e408ff45f6e7b591a27/experiments/starknet-failed-account/src/failed_account.ts#L24)

___

### failedAccountAddress

▸ **failedAccountAddress**(`publicKey`): `string`

Generates a failed account address based on the provided public key.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `publicKey` | `string` | The public key associated with the account. |

#### Returns

`string`

The generated account address.

#### Defined in

[failed_account.ts:10](https://github.com/0xknwn/starknet-modular-account/blob/c2960301b1b70ffa10998e408ff45f6e7b591a27/experiments/starknet-failed-account/src/failed_account.ts#L10)
