# Developing your Own Validator Module

A Validator Module can be used to change the way the Modular Account validates
transactions and messages. Validators can be used as the Core Validator, i.e.
they validate the transaction on the account by default. If not, they require
the transaction to be decorated with a prefix call to the `__module_validate__`
entrypoint.

This section provides directions about how to develop and test your own module.
If you are interested to extend the account with Validators, we suggest you
contact the project to get some help.

- [Developing your Own Validator Module](#developing-your-own-validator-module)
  - [Validator Module](#validator-module)
  - [Core Validator Interface](#core-validator-interface)
  - [Management Interface and Mappers](#management-interface-and-mappers)
  - [Other considerations](#other-considerations)
  
## Validator Module

A Validator is a class that implement the following interface:

```rust
#[starknet::interface]
pub trait IValidator<TState> {
    fn is_valid_signature(self: @TState, hash: felt252, signature: Array<felt252>) -> felt252;
    fn validate(self: @TState, grantor_class: ClassHash, calls: Array<Call>) -> felt252;
}
```

The 2 functions manages the following:

- `is_valid_signature`, given the `hash` that can be a transaction hash or a
  message hash should return `starknet::VALIDATED` is the signature is valid
  and 0 if not. Depending on the case, it can be that the function cannot be
  implemented. If that is the case, we suggest you return that the transaction
  is not valid
- `validate` generated the hash for a transaction and validates the transaction
  for the account. Opposite to `is_valid_signature`, `validate` has access to
  the whole transaction and, as such should always be fully implemented

> Note: the grantor class that is passed by the account is the Core Validator
> class hash registered with the account. It can be used for some specific
> use. For instance, in the case of the sessionkey validator, it enables the
> sessionkey validator module to validate the sessionkey authorization with the
> `is_valid_signature` from the Core Validator of the account.

## Core Validator Interface

In addition to the `IValidator` interface, Core Validator Modules must implement
the `ICoreValidator` interface. That is because the module has to configure
the account public key when the accounted is created the first time

```rust
#[starknet::interface]
pub trait ICoreValidator<TState> {
    fn initialize(ref self: TState, public_key: felt252);
}
```

## Management Interface and Mappers

Each Validator Module can provide some management functions to configure the
module. The name and implementation of those functions depend on the module. 

The management interface cannot be call on a class, they must be triggered on
a contract. To workaround that issue, the account provides 2 entrypoints
`execute_on_module` and `call_on_module` that can call the management
interface from the account. The `execute_on_module` provides some additional
security making sure that only the account signers can initiate those calls.

To allow the remove access between the account calls and the management
interface the validator requires the `call` and `execute` methods to be
implemented. Those methods map the input and output arguments of the management function. The associated interface looks like:

```rust
#[starknet::interface]
pub trait IConfigure<TState> {
    fn call(self: @TState, call: Call) -> Array<felt252>;
    fn execute(ref self: TState, call: Call) -> Array<felt252>;
}
```

> Note: To work the Call should include the following:
> - `selector` must be the selector for the management interface, i.e. the
>   `sn_keccak` of the entrypoint name
> - `to` should be the account address
> - `calldata` should be the call data as defined by the ABI of the class

## Other considerations

In addition to the feature above, we suggest a number of good practices to
develop modules

- Be very careful with Storage variable names as they can be accessed by
  another module. A good practice is to prefix those names with a prefix
  that is uniquely derived from the module. 
- Use the account `notify_owner_addition` and `notify_owner_removal` functions
  that are part of the internal implementation of the account to notify users
  of the addition/removal of public keys
- Add a Typescript/Javascript module SDK to the Modular Account SDK. That would
  allow applications to easily use your module and help with tests.
- Provide a set of tests to make sure the module is behaving correctly and so
  that people can understand how it is supposed to work
- Write a documentation both about the module and the SDK.
