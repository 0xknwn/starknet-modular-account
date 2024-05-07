# The SessionKey Validator Module

The SessionKey Validator Module is an implementation of a Validator Module for
the Starknet Modular Account. It must be used as a secondary Validator for the
Account and requires a Core Validator module to authorize the sessionkey. This
document explains the features, the configuration and some of the Internals
of this module.

- [The SessionKey Validator Module](#the-sessionkey-validator-module)
  - [Validator Module](#validator-module)
  - [Core Validator Interface](#core-validator-interface)
  - [Management Interface](#management-interface)
  - [Module Management Interface Mappers](#module-management-interface-mappers)
  - [Version Interface](#version-interface)
  
> Note: To understand the process of requesting a session key authorization and
> signing the authorization, you should check the documentation for the
> [Session Key Validator SDK](./SDKS-SESSIONKEY-VALIDATOR.md)

## Validator Module

A validator is a contract that implement the following interface:

```rust
#[starknet::interface]
pub trait IValidator<TState> {
    fn validate(self: @TState, grantor_class: ClassHash, calls: Array<Call>) -> felt252;
}
```

In the case of the sessionkey Validator the `validate` function checks the
transaction signature is valid by:

- making sure the session key has not been disabled with the module management
  interface.
- extracting the session key data and making sure they are valid, signed
  by the core validator and still properly configured in the account.
- check the transaction calls matches the policies associated with the session
  key by examining the merkle proofs of the signature and recomputing the
  merkle root with those proofs and the calls
- check the transaction is signed by the private key that has been granted
  the access by the session key.

> Note: the grantor class that is passed by the account is the Core Validator
> class hash registered with the account. In the case of the SessionKey 
> Validator it is used to check the session key authorization is actually
> valid with the Core Validator Signature.

## Core Validator Interface

This module cannot be used as a Core Validator. That is because the session key
needs to be authorized by the Core Validator Signer to be used. As a result, it
does not implement the `ICoreValidator` interface. In addition, a message cannot
be signed by a session key simply because the policy cannot apply to it and
there is no way to check a transaction hash is valid without the calls. That is
why the `is_valid_signature` cannot be implemented for that case.

## Management Interface

Each Validator Module can provide some management entrypoint to configure the
module. In the case of the Stark Validator, the management methods are:

```rust
#[starknet::interface]
pub trait IDisableSessionKey<TState> {
    fn disable_session_key(ref self: TState, sessionkey: felt252);
    fn is_disabled_session_key(self: @TState, sessionkey: felt252) -> bool;
}
```

As you can assess by their name:

- `disable_session_key` register the hash of the session key in the account to
  block a future attempt to use it again. Note that disabling is permanent and
  a session key must be re-emitted if necessary
- `is_disabled_session_key` list if a session key has been registered with the
  disabled session keys

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

- `call` takes calls to `is_disabled_session_key` and match the input/output on
  the account.
- `execute` takes calls to `disable_session_key` and match the input/output on
  the account.

> Note: To work the Call should include the following:
> - `selector` must be the selector for the management interface, i.e. the
>   `sn_keccak` of the entrypoint name
> - `to` should be the account address
> - `calldata` should be the call data as defined by the ABI of the class

## Version Interface

The Session Key Validator implements the `IVersion` interface below:

```rust
#[starknet::interface]
pub trait IVersion<TState> {
    fn get_version(self: @TState) -> felt252;
    fn get_name(self: @TState) -> felt252;
}
```

- `get_name()` returns `sessionkey-validator` in a shortString
- `get_version()` returns the version starting with a v, like `v0.1.8` as a 
  short string. 
