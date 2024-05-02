import fs from "fs";
import path from "path";
import { hash, json, CompiledContract, Account } from "starknet";

/**
 * Computes the hash of the requested class that is part of the
 * 0xknwn/starknet-modular-account project.
 * @param className - The name of the contract class.
 * @returns The hash of the contract class.
 * @remarks This function requires the cairo contract to be compiled with the
 * `scarb build` command at the root of the project.
 *
 */
export const classHash = (
  className:
    | "Counter"
    | "SimpleAccount"
    | "SwapRouter"
    | "TokenA"
    | "TokenB" = "Counter"
) => {
  const f = path.join("artifacts", `smartr_${className}.contract_class.json`);
  const contract: CompiledContract = json.parse(
    fs.readFileSync(f).toString("ascii")
  );
  return hash.computeContractClassHash(contract);
};

/**
 * If not already declared, declare the requested class from the
 * 0xknwn/starknet-modular-account project to the Starknet network used by the
 * provided account.
 * @param account The starknet.js account used to declare the class.
 * @param className The name of the class to declare. Defaults to "SmartrAccount".
 * @returns An object containing the declared class hash and the transaction
 * receipt if the class was not already declared.
 * @throws An error if the class deployment fails.
 * @remarks This function requires the cairo contract to be compiled with the
 * `scarb build` command at the root of the project. It also requires the
 * account to have enough funds to declare the class to the Starknet network.
 *
 */
export const declareClass = async (
  account: Account,
  className:
    | "Counter"
    | "SimpleAccount"
    | "SwapRouter"
    | "TokenA"
    | "TokenB" = "Counter"
) => {
  const HelperClassHash = classHash(className);

  try {
    await account.getClass(HelperClassHash);
    return {
      classHash: HelperClassHash,
    };
  } catch (e) {}

  const compiledTestSierra = json.parse(
    fs
      .readFileSync(
        path.join("artifacts", `smartr_${className}.contract_class.json`)
      )
      .toString("ascii")
  );
  const compiledTestCasm = json.parse(
    fs
      .readFileSync(
        path.join(
          "artifacts",
          `smartr_${className}.compiled_contract_class.json`
        )
      )
      .toString("ascii")
  );
  const declare = await account.declare({
    contract: compiledTestSierra,
    casm: compiledTestCasm,
  });
  return {
    ...(await account.waitForTransaction(declare.transaction_hash)),
    classHash: declare.class_hash,
  };
};
