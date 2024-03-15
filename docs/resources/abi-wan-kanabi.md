# `abi-wan-kanabi`

[abi-wan-kanabi](https://github.com/keep-starknet-strange/abi-wan-kanabi) is a
package that extracts the ABI from a compiled and provides the typescript
definition and binding to interact with that contract. It is very useful to
develop dapps. For instance, if you want to generate the typescript to interact
with one of the standard Starknet contracts that is developed by OpenZeppelin,
like the ERC20, build the OZ project like below:

```shell
git clone https://github.com/OpenZeppelin/cairo-contracts.git
cd cairo-contracts
scarb build
```

The classes you are looking for are generated in the `target/dev` directory, you
should be able to generate the associated .ts file from the `npx abi-wan-kanabi`
CLI like below:

```shell
npx abi-wan-kanabi --input ./target/dev/openzeppelin_ERC20.contract_class.json \
  --output ERC20.ts

Need to install the following packages:
  abi-wan-kanabi@2.2.1
Ok to proceed? (y) y
✅ Successfully generated ERC20.ts
💡 Here's a code snippet to get you started:

import { Contract, RpcProvider, constants } from 'starknet';
import { ABI } from './ERC20';

async function main() {
    const address = "CONTRACT_ADDRESS_HERE";
    const provider = new RpcProvider({ nodeUrl: constants.NetworkName.SN_MAIN });
    const contract = new Contract(ABI, address, provider).typedv2(ABI);

    const version = await contract.getVersion();
    console.log("version", version)

    // Abiwan is now successfully installed, just start writing your contract
    // function calls (`const ret  = contract.your_function()`) and you'll get
    // helpful editor autocompletion, linting errors ... for free ! Enjoy !
}
main().catch(console.error)
```
