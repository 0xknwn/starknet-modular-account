# Lessons learned and additional techniques

There are a few things we have learned along the way by attempting different
implementations and reading from documentations, proposals and source code.

## Adding/removing a prefix to the calls

For now on, the implementation relies on the fact we decorate the calls with
a prefix call that hold the execution of the modules.

A few comments about this approach:
- the network, i.e. starknet, checks the prefix is valid, i.e the account
  address in the `to` attribute is valid and the entrypoint in the `selector`
  attributes exists. To workaround this issue we have added an external function
  to the account named `__module_validate__` that checks that is the account
  that runs it. There are 2 benefits to that approach:

  1. It passes the protocol check. Because the function exists, it is allowed
     to call it and the estimate fee call succeeds.
  2. It simplifies the management of the calls. We did not need to "remove" the
     prefix from the list of calls. Since it is a function that does nothing,
     we can simply leave it in the list of calls.

> Note: we have written some code to remove the prefix call from the
> `__execute__` function. However, it looks like the estimate fee does not
> run that function and the call is still executed in that part. Again,
> because of the workaround of creating the function, it does not really
> matter. What we have check also is that, it is still possible to manipulate
> call at execution time and we could have removed the first call if we
> wanted.

To figure out the module class to use, we rely on the first parameter of the
`__module_validate__` that we have named `class_hash`. Internally, we are
checking the module is installed in the account by checking the associated
storage variable.

> Note: this makes the `__validate__` call more complex and monitoring the
> number of steps required to run the code is key. For now, the parameter
> is called `validate_max_n_steps` and is set to 1,000,000. We would have
> to test that value. see
> [network constants](https://github.com/starkware-libs/blockifier/blob/main/crates/blockifier/resources/versioned_constants.json)
> for details about that value in the coming releases.

## Other Implementations

### Kernel

Kernel is a MIT-licensed solidity abstract account developed by zerodev and used
by a number of signers.

Kernel has has 2 types of validators, i.e modules that checks the signature is
valid:
- `sudo` validators that can be used to allow other validators: there can only
  be one `sudo` validator at a time; it is registered within the account; only
  the `sudo` validator can do specific operations like changing its
  configuration or changing for another `sudo` validator
- `regular` validators that are used to execute calls

I am guessing here, but I assume that you cannot run if the `sudo` validator
directly, instead you would have to grant access to a regular validator and then
execute from it. The benefit of that approach would be that we could force the
execution of a pre-step as part of the autorization associated with the regular
validator. Assuming the `sudo` validator is a multisig, this open the door to
a lot of scenarios.

### starknet-plugin-account

[starknet-plugin-account](https://github.com/argentlabs/starknet-plugin-account)
provides a lot of ideas even if the code is obsolete. One of the questions is
"why did the implementation stop?". It could not be figured out from the
repository and some of the hypothesis we could make is:

- it has hit a technical issue that would prevent the development of such a
  solution
- the complexity was too high and the number of "tricks" used too many so that
  it would make the solution difficult to secure and program
- people involved with the implementation have changed their priorities or
  disagreed on what was possible
- the plugin distribution would be hard to tackle even if now, approaches like
  the Safe{Core} Protocol or EIP-7484 attempt to address them
- the move toward cairo 1.0+ would have make it stop for a while and it did not
  restart because of people's mind/priorities have changed

On the technical side, reviewing the code:

- [starknet-plugin-account](https://github.com/argentlabs/starknet-plugin-account)
  relies on the signature to pass values to the `__validate__` entrypoint, which
  is not the case with `starknet-modular-account` for now. The way it works is:
  - the plugin class hash is passed as the first value of the signature making
    it possible to find the plugin. It make it mandatory to pass a parameter
    that could be 0x0 or the original signer class hash that would have to be
    protected with a prior registration.
  - the class hash from the original signer is part of the session key token
    making is possible to check the validity of the token (authn)

> **NOTE** relying on the signature for the validation makes a lot of sense
> because, that is the purpose of it after all.

Beside this difference, there are also a few other questions/issues to
investigate to make sure we can cover all the feature of the account:
- the implementation of `read_on_plugin` has not been done despite part of the
  readme.
- the contract includes the `__default__` and `__l1_default__` entrypoints. They
  seem to be some failabck function that do not look to be working anymore.
  Maybe it was working at the time.
- the account was implementing the `supportsInterface`. How useful is it? Should
  we implement that also
- last but not least the account was providing a getter function for a name and
  version. This would be useful both for the account and for the modules.

## Questions

What we have learned sofar opens a number of questions that we would answer over
time:

- Why does Starknet not have a `fallback` entrypoint in contracts like solidity
  does so that, if a function does not exist, this function is called. Is there
  some sort of plan to support it?
- How would an external signer (wallet application) add to the estimateFee in
  order to cover some additional logic not detected by the estimateFee
- Can you call a contract as part of the __validate__ call?
