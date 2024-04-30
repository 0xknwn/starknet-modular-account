<h1>Concepts</h1>

<h2>Table of Contents</h2 

- [Accounts and the Modular Account](#accounts-and-the-modular-account)
  - [Account Interface](#account-interface)
  - [The Modular Account](#the-modular-account)
  - [Validator and Core Validator Modules](#validator-and-core-validator-modules)
  - [Validator Modules and Prefix Call](#validator-modules-and-prefix-call)
  - [Executor Modules](#executor-modules)
  - [Additional Account Interfaces](#additional-account-interfaces)
  - [Module Management](#module-management)
  - [Module Configuration](#module-configuration)
  - [Prefix functions](#prefix-functions)
  - [Upgrade and Backward Compatibility](#upgrade-and-backward-compatibility)
- [Modules](#modules)
  - [Validator Interfaces](#validator-interfaces)
  - [Validator Configuration](#validator-configuration)
  - [Validator Entrypoints](#validator-entrypoints)
- [To continue](#to-continue)

## Accounts and the Modular Account

The starknet modular account is a configurable account that provides standard
features and delegates others to some modules of choice. For instance, the
account enables users to add and remove modules; it allows to execute a method
of a module. On the other hand, the account delegates the validation of
transactions to modules. This account/module split simplifies the development
of specific features; it provides an account that can easily evolve to match the
user requirements and be extended...

This document presents the different aspects and interfaces of the modular
account as well as modules. It introduces how the account works in general and
how the modular account is different. This document is useful for developing
new modules. It also provides hints about accessing and managing the modular
account from an application.

### Account Interface

Abstract accounts or smart accounts are key components of the Starknet protocol.
On most blockchains, the source of a transaction is a public key, i.e. the
counterpart of your keys that remain secret. In the case of Starknet, the source
of a transaction is always an account address. This leads to an immediate
question that is "How do you create an account?". As you can guess, you need to
run a transaction create an account. In some cases, you will not even have an
account to proceed. If this question is out of the scope of this document, this
answer to that question is pretty "smart" and we encourage you to find it.

So, except for the account creation that relies on a specific syscall, Starknet
interacts with the account both before and during the execution of a
transaction. How the account behaves is not part of the protocol which leaves a
lot of freedom to developers. To work correctly, however, Starknet requires the
account to implement the `__validate__` and `__execute__` entrypoints in an
account contract. To say it otherwise, that is the interface that does the
account.

The account interface as described in both
[SNIP-6](https://github.com/starknet-io/SNIPs/blob/main/SNIPS/snip-6.md) and the
[comments on this thread](https://community.starknet.io/t/snip-starknet-standard-account/95665).
The code below provides the standard definition of a Starknet account! A
Starknet account is a Starknet contract that implements the following interface:

```rust
struct Call {
    to: ContractAddress,
    selector: felt252,
    calldata: Array<felt252>
}

/// @title SRC-6 Standard Account
trait ISRC6 {
    /// @notice Execute a transaction through the account
    /// @param calls The list of calls to execute
    /// @return The list of each call's serialized return value
    fn __execute__(calls: Array<Call>) -> Array<Span<felt252>>;

    /// @notice Assert whether the transaction is valid to be executed
    /// @param calls The list of calls to execute
    /// @return The string 'VALID' represented as felt when is valid
    fn __validate__(calls: Array<Call>) -> felt252;

    /// @notice Assert whether a given signature for a given hash is valid
    /// @param hash The hash of the data
    /// @param signature The signature to validate
    /// @return The string 'VALID' represented as felt when the signature is valid
    fn is_valid_signature(hash: Array<felt252>, signature: Array<felt252>) -> felt252;
}
```

It is very simple both to understand and to conform to the account development
specification. As a result, an account can be develop that does things that
you would not expect from a regular chain like:
- blindly validate all the transactions that are submitted. This scenario that
  we call the Yasager or Yeasayer is a very interesting to code; at least to
  learn more about accounts
- execute something very different from what the transaction requests. For
  instance we could store a signature that would allow to execute the requested
  transaction later on a different call and execute nothing

### The Modular Account

The starknet modular account is an implementation of an account so that you can 
develop and register a module that are triggered from inside the `__validate__`
and/or `__execute__` entrypoints. The benefit of this approach is that you
can develop some code that change the behavior of the account without rewriting
a whole account.

There are 2 types of modules for the starknet modular account:

- Validator Modules that are triggered when validating a transaction
- Executor Modules that are triggered when executing a transaction

> Note: Only Validator Modules are implemented for now. Executor Modules are
> part of the Modular Account [roadmap](./ROADMAP.md).

### Validator and Core Validator Modules

A validator module is a contract that implements the following interface and
can be used by the account to delegate the transaction validation and additional
message signature check. The later is used to support and verify offchain
signatures:

```rust
/// @title Validator Module Interface
trait IValidator {
    fn validate(calls: Array<Call>) -> felt252;

    fn is_valid_signature(hash: Array<felt252>, signature: Array<felt252>) -> felt252;
}
```

As you can guess Validator modules "replace" the `__validate__` and
`is_valid_signature` entrypoints of the account:

> Note: `__validate__` is a reserved entrypoint name for the account and the
> cairo compiler treat them differently. That is why the module entrypoint are
> named `validate` and not `__validate__` but that should have been the case.

When installing the modular account, not only the public key of the signer is
required like on most account but the **core** validator module class hash(*)
is also mandatory. So "the" **core** validator module is a module, i.e. a class,
that contains the logic that manages the account `__validate__` and
`is_valid_signature` by default. It has some specific requirement when comparing
with other validator modules and in particular, it cannot reference the core
validator. For now, the only core validator module available is the stark
module; it:

- computes the transaction into a a pedersen hash
- validate the transaction signature with the stark curve

That is why the modular account constructor is the following:

```rust
#[constructor]
fn constructor(ref self: ContractState, core_validator: felt252, public_key: felt252) {
    self.account.initializer(core_validator, public_key);
}
```

> (*) the core_validator is a felt252 and not a ClassHash type due to some
> technical constraints on the validation of the account deployment. However
> the external representation of a ClassHash is the same as the one from a
> felt252.
 
### Validator Modules and Prefix Call

So if there is a **core** validator module that is used by default by the
modular account, other validator modules can also be used in addition to it.
In order to be triggered, a number of conditions must be met:

- the validator module class must be declared to the network
- the validator module class has must be added to the account with the module
  management API as described in [Module Management](#module-management)
- some metadata in the form of a prefix call(**) must be added to the
  transaction

Assuming the module is declared in the network and installed in the modular
account, adding a prefix will trigger it. But what is a prefix? Let's say
a transaction is a set of calls like this:

```javascript
[call1, call2, ..., callN]
```

A prefixCall with the following structure has to be created:

```javascript
const prefixCall: Call = {
  contractAddress: accountAddress,
  // selector!("__module_validate__")
  entrypoint: moduleEntrypointSelector,
  calldata: [
    moduleClassHash,
    ...otherValidatorArgs,
  ]
}
```

And the transaction that will be requested will actually be the following:

```javascript
[prefixCall, call1, call2, ..., callN]
```

As a matter of fact the `prefixCall` does not modify the execution of the
transaction that will be made of the other calls from 1 to N. Instead, it
modifies the behavior of the account `__validate__` entrypoint that will check
the validation is compliant with the module requirements. In this call, the
following values are used:

- `accountAddress` is the account address. If you use another address the call
  will fail
- `moduleEntrypointSelector` is the `sn_keccak` of `__module_validate__` so
  it is a fixed value
- `moduleClassHash` that is passed as the first parameter of the `calldata`
  is the module class hash taht is being used
- `otherValidatorArgs` is an array of felt252 that can be used to pass some
  parameters to the module so that it can actually validate the transactions.
  For instance in the case of a Yasager module, it could be that no other
  parameters are used. 

> (**) As discussed in the [roadmap](./ROADMAP.md), we are exploring some
> changes so that the validator module does not need to use a prefix call.
> However the SDKs are masking the complexity associated with generating that
> call and there is not guarranty for now that this change that will land in
> the signature will actually work.

### Executor Modules

The executor module are implemented for now. They will rely on the same usage of
a prefix call with a `moduleEntrypointSelector` that is the `sn_keccak` of
`__module_execute__`.

### Additional Account Interfaces

The modular account provides another set of interfaces to interact with modules.
The code below shows the interface definition:

```rust
#[starknet::interface]
pub trait IModule<TState> {
    fn __module_validate__(self: @TState, calldata: Array<felt252>);
    fn __module_execute__(self: @TState, calldata: Array<felt252>);
    fn add_module(ref self: TState, class_hash: ClassHash);
    fn remove_module(ref self: TState, class_hash: ClassHash);
    fn update_core_module(ref self: TState, class_hash: ClassHash);
    fn get_core_module(self: @TState) -> ClassHash;
    fn is_module(self: @TState, class_hash: ClassHash) -> bool;
    fn call_on_module(self: @TState, class_hash: ClassHash, call: Call) -> Array<felt252>;
    fn execute_on_module(ref self: TState, class_hash: ClassHash, call: Call) -> Array<felt252>;
}
```

### Module Management

The account provides 2 sets of interfaces to manage the core module and other
modules:

- `get_core_module` and `update_core_module` enables to check the current core
  module and to change it for another module.
- `add_module`, `remove_module` and `is_module` enables to add, remove and check
  the account modules that are not the core validator module

> Note: `update_core_module` is very risky and probably contains flows right now

### Module Configuration

Module configuration depends on the module and requires you call the module
entrypoint from the account. The account provides 2 helper functions that are
used by the SDKs to grant those accesses. The functions are:

- `call_on_module` a view function that allows interactions with the view
  functions of a module
- `execute_on_module` that can be used to run transactions on the module from
- the account (and only from it).

### Prefix functions

`__module_validate__` and `__module_execute__` are functions that do nothing.
They are part of the account so that when you prefix the calls the transaction
does not fail because Starknet nodes checks for the existence of an entrypoint
as part of the transaction validation process.

### Upgrade and Backward Compatibility

The modular account implements the openzeppelin `Upgradeable` interface that is
the following:

```rust
fn upgrade(ref self: ContractState, new_class_hash: ClassHash)
```

It enables both to upgrade accounts and to move to another version of the
account like the one from openzeppelin, argent or braavo. **Be Careful**
moving to another account requires you update the internal state of the account
so that it works correctly and upgrading without updating the state will for
sure break it in an **IRREVERSIBLE** way. The
`experiments/starknet-bootstrap-account` provides some the basic principle that
can be used to perform those migrations but it needs to be developed and
battle-tested. We do not know if the reverse, i.e. moving from another account
to the 

## Modules

The project comes with 2 validator modules:

- The [stark validator](./STARK-VALIDATOR.md) that can be used as a core
  validator for the modular account. This relies on a pedersen-based hash of
  the transaction and the stark curve signature verification primitives to
  validate transactions.
- The [sessionkey validator](./SESSIONKEY-VALIDATOR.md) that requires an access
  to the core validator. The sessionkey validator requires an offchain
  authorisation to be granted by the account signer and allows a 3rd party to
  run a limited number of transactions with the account.

### Validator Interfaces

Like mentioned above, validators must implement the following interface to work
properly. How the implementation is done depends on the requirements...

```rust
/// @title Validator Module Interface
trait IValidator {
    fn validate(calls: Array<Call>) -> felt252;

    fn is_valid_signature(hash: Array<felt252>, signature: Array<felt252>) -> felt252;
}
```

### Validator Configuration

In order to allow calls and execution on the account with the entrypoints from
the module, the module must also implement the following interface. The `call`
and the `execute` functions map the input and output respectively between the
`call_on_module` and `execute_on_module` on the account and the view functions
and the external functions of the module on the other side.

```rust
pub trait IConfigure {
    fn call(self: @TState, call: Call) -> Array<felt252>;
    fn execute(ref self: TState, call: Call) -> Array<felt252>;
}
```

As a result, to provide an access to the configuration of a module, not only
use must add the required entrypoint in the module but you must also provide
the mapping in one of these 2 functions.

### Validator Entrypoints

The entrypoints associated with each module are specific to the module. They
can be whatever is required by the module. Below are the entrypoints:

- For the stark validator

```rust
pub trait IPublicKeys{
    fn add_public_key(ref self: ContractState, new_public_key: felt252);
    fn get_public_keys(self: @ContractState) -> Array<felt252>;
    fn get_threshold(self: @ContractState) -> u8;
    fn remove_public_key(ref self: ContractState, old_public_key: felt252);
    fn set_threshold(ref self: ContractState, new_threshold: u8);
}
```

- For the sessionkey validator

```rust
pub trait IDisableSessionKey {
    fn disable_session_key(ref self: ContractState, sessionkey: felt252);
    fn is_disabled_session_key(self: @ContractState, sessionkey: felt252);
}
```

## To continue

Do not hesitate to open an issue on the project if you have question or think
some sections of this document need to be improved.
