## Lessons Learned

There are a few things we have learned along the road:

### Adding/removing a prefix call to the calls

In order to trigger the use of a module, the technique that is used is by
adding a prefix. The network, i.e. starknet, now checks the prefix is valid,
i.e the account address in the `to` attribute is valid and the entrypoint in 
the `selector` attributes exists. To workaround this issue we have added an
external function to the account named `__module__validate__` that checks
that is the account that runs it. There are 2 benefits to that approach:

1. It passes the protocol check. Because the function exists, it is allowed
   to call it and the estimate fee call succeeds.
2. It simplify the management of the calls. We did not need to "remove" the
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
`__module__validate__` that we have named `class_hash`. Internally, we are
checking the module is installed in the account by checking the associated
storage variable.

> Note: this makes the `__validate__` call more complex and monitoring the
> number of steps required to run the code is key. For now, the parameter
> is called `validate_max_n_steps` and is set to 1,000,000. We would have
> to test that value. see
> [network constants](https://github.com/starkware-libs/blockifier/blob/main/crates/blockifier/resources/versioned_constants.json)
> for details about that value in the coming releases.
