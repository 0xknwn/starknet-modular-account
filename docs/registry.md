
Assuming we can call a library from the __validate__ entrypoint, we propose the following:
- the list of validator plugins should be managed in a library so that it can be checked at execution time
- we should have a contract with the expired validator so that the lib does not change, we can blacklist a validator. In that case, it would be executed in the __execute__