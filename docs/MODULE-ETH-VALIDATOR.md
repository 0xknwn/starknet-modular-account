# The Eth Validator Module

The Eth Validator Module is an implementation of a Validator Module for the
Starknet Modular Account. It can be used as the Core Validator or as a secondary
Validator for the Account. This document explains the features, the
configuration and some of the Internals of this module.

- [The Eth Validator Module](#the-eth-validator-module)
  - [Validator Module](#validator-module)
  - [Core Validator Interface](#core-validator-interface)
  - [Management Interface](#management-interface)
  - [Version Interface](#version-interface)
  - [Module Management Interface Mappers](#module-management-interface-mappers)

## Validator Module

A validator is a contract that implement the following interface:

```rust
#[starknet::interface]
trait IValidator<TState> {
    fn validate(self: @TState, grantor_class: ClassHash, calls: Array<Call>) -> felt252;
}
```

`validate` is used to validate a transaction on the account. It
  - gets the hash for the current transaction from the network
  - use `is_valid_signature` to check the signature is valid

> Note: the grantor class that is passed by the account is the Core Validator
> class hash registered with the account. In the case of the Eth Validator
> it is the module class hash. The validator does not use that parameter.

## Core Validator Interface

In addition to the `IValidator` interface, The Eth Validator Module implements
the `ICoreValidator` interface. That is because the Eth Validator can be
installed as a Core Validator Module, i.e. the default Validator for the account.
The interface looks like this:

```rust
#[starknet::interface]
pub trait ICoreValidator<TState> {
    fn is_valid_signature(self: @TState, hash: Hash<felt252>, signature: Array<felt252>) -> felt252;
    fn initialize(ref self: TState, public_key: Array<felt252>);
}
```

In the case of the Eth Validator the 2 functions are:

- `is_valid_signature`. It checks a hash of a transaction or a hash of a message
  matches the account public keys of the current configurationm i.e stored in
  the account storage. It checks the elements of the signature are valid
  considering the public keys registered in the account
- `initialize` is used at the installation time of the account to store the
  first account public key. In the case of the Eth Validator, the public key
  is managed by an array of 4 felt.

> Note: In the case of the Eth Validator, the downgrade from the account back
> to an OpenZeppelin Account as not been tested.

## Management Interface

Each Validator Module can provide some management entrypoint to configure the
module. In the case of the Eth Validator, the management methods are:

```rust
#[starknet::interface]
pub trait IPublicKeys<TState> {
    fn set_public_key(ref self: TState, new_public_key: Array<felt252>);
    fn get_public_key(self: @TState) -> Array<felt252>;
}
```

As you can assess by their name:

- `set_public_key` changes the public key associated with the account. Be
  careful that it removes the existing key
- `get_public_key` returns the elements of current public keys registered with
  the account

## Version Interface

The Stark Validator implements the `IVersion` interface below:

```rust
#[starknet::interface]
pub trait IVersion<TState> {
    fn get_version(self: @TState) -> felt252;
    fn get_name(self: @TState) -> felt252;
}
```

- `get_name()` returns `eth-validator` in a shortString
- `get_version()` returns the version starting with a v, like `v0.1.8` as a 
  short string. 

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

In the case of the Eth Validator:

- `call` can takes calls to `get_public_key`, `get_name` and `get_version`.
- `execute` can execute calls to `set_public_key`.

> Note: To work the Call should include the following:
> - `selector` must be the selector for the management interface, i.e. the
>   `sn_keccak` of the entrypoint name
> - `to` should be the account address
> - `calldata` should be the call data as defined by the ABI of the class and
  in the case of an EthPublicKey, it should be an array of 4 felts.
