import {
  hash,
  json,
  CompiledContract,
  Account,
  UniversalDetails,
} from "starknet";
import { b64toascii } from "./b64toascii";
import { data as StarkValidatorContract } from "./artifacts/StarkValidator-contract";
import { data as StarkValidatorCompiled } from "./artifacts/StarkValidator-compiled";
import { data as SimpleValidatorContract } from "./artifacts/SimpleValidator-contract";
import { data as SimpleValidatorCompiled } from "./artifacts/SimpleValidator-compiled";
import { data as SmartrAccountContract } from "./artifacts/SmartrAccount-contract";
import { data as SmartrAccountCompiled } from "./artifacts/SmartrAccount-compiled";

export enum classNames {
  StarkValidator = "StarkValidator",
  SimpleValidator = "SimpleValidator",
  SmartrAccount = "SmartrAccount",
}

/**
 * Computes the hash of the requested class that is part of the
 * 0xknwn/starknet-modular-account project.
 * @param className - The name of the contract class.
 * @returns The hash of the contract class.
 * @remarks This function requires the cairo contract to be compiled with the
 * `scarb build` command at the root of the project.
 *
 */
export const classHash = (className: classNames = classNames.SmartrAccount) => {
  let contract: string = "";
  switch (className) {
    case classNames.StarkValidator:
      contract = StarkValidatorContract;
      break;
    case classNames.SimpleValidator:
      contract = SimpleValidatorContract;
      break;
    case classNames.SmartrAccount:
      contract = SmartrAccountContract;
      break;
    default:
      throw new Error("Invalid class name");
  }
  const loadedContract: CompiledContract = json.parse(b64toascii(contract));
  return hash.computeContractClassHash(loadedContract);
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
  className: classNames,
  details?: UniversalDetails
) => {
  const HelperClassHash = classHash(className);

  try {
    await account.getClass(HelperClassHash);
    return {
      classHash: HelperClassHash,
    };
  } catch {
    // continue with the declare when the class is not declared
  }

  let contract: string = "";
  switch (className) {
    case classNames.StarkValidator:
      contract = StarkValidatorContract;
      break;
    case classNames.SimpleValidator:
      contract = SimpleValidatorContract;
      break;
    case classNames.SmartrAccount:
      contract = SmartrAccountContract;
      break;
    default:
      throw new Error("Invalid class name");
  }

  let compiled: string = "";
  switch (className) {
    case classNames.StarkValidator:
      compiled = StarkValidatorCompiled;
      break;
    case classNames.SimpleValidator:
      compiled = SimpleValidatorCompiled;
      break;
    case classNames.SmartrAccount:
      compiled = SmartrAccountCompiled;
      break;
    default:
      throw new Error("Invalid class name");
  }

  const compiledTestSierra = json.parse(b64toascii(contract));
  const compiledTestCasm = json.parse(b64toascii(compiled));
  const declare = await account.declare(
    {
      contract: compiledTestSierra,
      casm: compiledTestCasm,
    },
    details
  );
  return {
    ...(await account.waitForTransaction(declare.transaction_hash)),
    classHash: declare.class_hash,
  };
};
