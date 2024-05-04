# The Stark Validator Module

The Stark Validator Module is an implementation of a Validator Module for the
Starknet Modular Account. It must be used as the Core Validator for the Account.
This document explains the features, the configuration and some of the Internals
of this module.

- [The Stark Validator Module](#the-stark-validator-module)
  - [Validator Module](#validator-module)
  - [Core Validator Interface](#core-validator-interface)
  - [Management Interface](#management-interface)
  - [Module Management Interface Mappers](#module-management-interface-mappers)

## Validator Module

A validator is a contract that implement the following interface:

```rust
#[starknet::interface]
pub trait IValidator<TState> {
    fn is_valid_signature(self: @TState, hash: felt252, signature: Array<felt252>) -> felt252;
    fn validate(self: @TState, grantor_class: ClassHash, calls: Array<Call>) -> felt252;
}
```

In the case of the Stark Validator the 2 functions manages the following:

- `is_valid_signature` being given a hash that can be a hash of a
  transaction or a hash of a message as well as a signature check if this is a
  valid signature given the current configuration (i.e storage) of the account.
  To proceed it does the following:
  - It checks the elements of the signature are valid considering the public
    keys registered in the account
  - It checks the number of valid signature matches the threshold defines in
    the account.
- `validate` on the other hand, should be used to validate a transaction. That
  is not yet the case because of [#136 Improve the Stark/Core Validator Class](https://github.com/0xknwn/starknet-modular-account/issues/136). The intend
  behavior of this method should be:
  - to compute the hash for the current transaction to validate based on
    Starknet default mecasnism as it is currently implemented in the account
  - use `is_valid_signature` to check the signature is valid considering the
    current transaction.

> Note: the grantor class that is passed by the account is the Core Validator
> class hash registered with the account. In the case of the Stark Validator
> it should be the module class hash. The validator does not use that parameter.

## Core Validator Interface

In addition to the `IValidator` interface, The Stark Validator Module implements
the `ICoreValidator` interface. That is because the Stark Validator can be
installed as a Core Validator Module, i.e. the default Validator for the account.
The interface looks like this:

```rust
#[starknet::interface]
pub trait ICoreValidator<TState> {
    fn initialize(ref self: TState, public_key: felt252);
}
```

The associated method is used when the account is created so that the Core
module can store the public key of the signer. In the case of the Stark
Validator the key is simply stored in the `Account_public_keys` storage. It
is also stored in the `Account_public_key` so that we can upgrade the account
back and forth with an OpenZeppelin Account.

## Management Interface

Each Validator Module can provide some management entrypoint to configure the
module. In the case of the Stark Validator, the management methods are:

```rust
#[starknet::interface]
pub trait IPublicKeys<TState> {
    fn add_public_key(ref self: TState, new_public_key: felt252);
    fn get_public_keys(self: @TState) -> Array<felt252>;
    fn get_threshold(self: @TState) -> u8;
    fn remove_public_key(ref self: TState, old_public_key: felt252);
    fn set_threshold(ref self: TState, new_threshold: u8);
}
```

As you can assess by their name:

- `add_public_key` adds a public key into the account. Be careful that it does
  not remove the existing key that must be managed separately.
- `remove_public_key` removes a public key from the account.
- `get_public_keys` returns the list of current public keys registered with
  the account
- `set_threshold` defines the number of signer that must sign a transaction or
  message for the signature to be valid
- `get_threshold` list the current threshold of the account.

## Module Management Interface Mappers

The management interface cannot be call on a class, they must be triggered on
a contract. To workaround that issue, the account provides 2 entrypoints
`execute_on_module` and `call_on_module` that can call the management
interface from the account. The `execute_on_module` provides some additional
security making sure that only the account signers can initiate those calls.

To allow the remove access between the account calls and the management
interface the validator requires the `call` and `execute` method are implemented
and does map the input and output arguments correctly. That is the following
interface:

```rust
#[starknet::interface]
pub trait IConfigure<TState> {
    fn call(self: @TState, call: Call) -> Array<felt252>;
    fn execute(ref self: TState, call: Call) -> Array<felt252>;
}
```

In the case of the Stark Validator:

- `call` can takes calls to `get_public_keys` and `get_threshold` and match the
  input/output on the account.
- `execute` takes calls to `add_public_key`, `remove_public_keys` and
  `set_threshold` and match the input/output on the account.

> Note: To work the Call should include the following:
> - `selector` must be the selector for the management interface, i.e. the
>   `sn_keccak` of the entrypoint name
> - `to` should be the account address
> - `calldata` should be the call data as defined by the ABI of the class
