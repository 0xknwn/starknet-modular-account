# Using Multiple Signers

The starknet modular account not only can have multiple signers registered but
it can also require N of those signers to agree to sign a transaction. This
This Multisig feature takes place offchain and the `SmartrAccount` class
provides the framework to have several accounts sign the same transaction. This
is what is shown in this section.

> Note: This section assumes the `SmartrAccount` class has been instantiated
> in the `smartrAccount` variable as shown in
> [Using the modular account from the SDK](./SDKS-DEPLOYMENT.md#using-the-modular-account-from-the-sdk).
> It also assumes the `Counter` contract that comes with the project has been
> deploys to the `counterAddress` and the `CounterABI` class is available. The
> `03-setup.ts` script that comes with this project ensure those steps are
> executed.

- [Using Multiple Signers](#using-multiple-signers)
  - [An Account with 3 Registered Keys](#an-account-with-3-registered-keys)
  - [Changing the Account Threshold to 2](#changing-the-account-threshold-to-2)
  - [Prepare the Transaction](#prepare-the-transaction)
  - [Sign the Transaction with Multiple Accounts](#sign-the-transaction-with-multiple-accounts)
  - [Execute the Transaction](#execute-the-transaction)
  - [Reset the Account Threshold to 1](#reset-the-account-threshold-to-1)
  - [Remove Registered Keys](#remove-registered-keys)

## An Account with 3 Registered Keys

## Changing the Account Threshold to 2

## Prepare the Transaction

## Sign the Transaction with Multiple Accounts

## Execute the Transaction

## Reset the Account Threshold to 1

## Remove Registered Keys
