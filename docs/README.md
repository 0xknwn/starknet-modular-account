# starknet-modular-account

This project is an implementation of a Modular Account for Starknet. It includes
a reference account; a set of extensible/reusable components to build your own
tool; modules, including a sessionkey validator; a set of SDKs based on 
starknet.js to use the account in a Dapp or a signer; tests to demonstrate
how to use the account and a documentation.

> ⚠️ ⚠️ ⚠️ this project is very much a work-in-progress and has not been
> audited yet ⚠️ ⚠️ ⚠️

## Why Develop Another Smart Account?

Starknet has been a place of innovation for Smart Accounts since the very start.
Thank to actors like Starkware, Openzeppelin, Argent, Ledger, Cartridge, Braavos
or Equilibrium, the user experience has no equivalent. However, implementations
are not always compatible and it is hard for teams that need specific features
to get it from even one provider or to develop it.

Meanwhile, the Smart Account Ecosystem on Ethereum has grown and a number of 
ideas have shown up that could be implemented on Starknet.
starknet-modular-account is an extensible account that allow developers to
write modules for specific use cases. You should see it as an experiment or
a wish to get:

- **extensibility**: we could add features to Starknet that we can already find
  with Ethereum Smart Account and Multisig like Safe, Kernel or the Alchemy
  accounts
- **interoperability**: we could develop modules with clean interfaces that
  would be re-used by widespread accounts
- **security**: we could audit components not large account code base
- **ease of use**: we could reference a module registry that accounts providers
  would reference and user understand

Doing it as a community project would help everybody to get those feature 
**now** if they want...

## License

The project is licensed as a [MIT](./LICENSE.md)
