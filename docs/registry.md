## How to secure the use of plugins

### A simple idea

Assuming we can call a library from the __validate__ entrypoint, we propose the following:
- the list of validator plugins should be managed in a library so that it can be checked at execution time
- we should have a contract with the expired validator so that the lib does not change, we can blacklist a validator. In that case, it would be executed in the __execute__

### More advanced ideas

- [EIP-7484](https://eips.ethereum.org/EIPS/eip-7484)
- [Safe{Core} Protocol](https://forum.safe.global/t/safe-core-protocol-whitepaper/3949)
