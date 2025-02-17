import {
  hash,
  json,
  CompiledContract,
  Account,
  UniversalDetails,
} from "starknet";
import { b64toascii } from "./b64toascii";
import { data as GuardedValidatorContract } from "./artifacts/GuardedValidator-contract";
import { data as GuardedValidatorCompiled } from "./artifacts/GuardedValidator-compiled";
import { data as EthValidatorContract } from "./artifacts/EthValidator-contract";
import { data as EthValidatorCompiled } from "./artifacts/EthValidator-compiled";
import { data as MultisigValidatorContract } from "./artifacts/MultisigValidator-contract";
import { data as MultisigValidatorCompiled } from "./artifacts/MultisigValidator-compiled";
import { data as P256ValidatorContract } from "./artifacts/P256Validator-contract";
import { data as P256ValidatorCompiled } from "./artifacts/P256Validator-compiled";
import {
  classHash as coreClassHash,
  declareClass as coreDeclareClass,
  classNames as coreClassNames,
} from "@0xknwn/starknet-modular-account";
export const __module_validate__ =
  "0x119c88dea7ff05dbe71c36247fc6682116f6dafa24089373d49aca7b2657017";

export enum classNames {
  EthValidator = "EthValidator",
  GuardedValidator = "GuardedValidator",
  MultisigValidator = "MultisigValidator",
  P256Validator = "P256Validator",
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
export const classHash = (className: classNames = classNames.EthValidator) => {
  let contract: string = "";
  switch (className) {
    case classNames.GuardedValidator:
      contract = GuardedValidatorContract;
      break;
    case classNames.EthValidator:
      contract = EthValidatorContract;
      break;
    case classNames.MultisigValidator:
      contract = MultisigValidatorContract;
      break;
    case classNames.P256Validator:
      contract = P256ValidatorContract;
      break;
    default:
      throw new Error("Invalid class name");
  }
  const loadedContract: CompiledContract = json.parse(
    b64toascii(contract)
  );
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
  } catch (e) {}

  let contract: string = "";
  switch (className) {
    case classNames.EthValidator:
      contract = EthValidatorContract;
      break;
    case classNames.GuardedValidator:
      contract = GuardedValidatorContract;
      break;
    case classNames.MultisigValidator:
      contract = MultisigValidatorContract;
      break;
    case classNames.P256Validator:
      contract = P256ValidatorContract;
      break;
    default:
      throw new Error("Invalid class name");
  }

  let compiled: string = "";
  switch (className) {
    case classNames.EthValidator:
      compiled = EthValidatorCompiled;
      break;
    case classNames.GuardedValidator:
      compiled = GuardedValidatorCompiled;
      break;
    case classNames.MultisigValidator:
      compiled = MultisigValidatorCompiled;
      break;
    case classNames.P256Validator:
      compiled = P256ValidatorCompiled;
      break;
    default:
      throw new Error("Invalid class name");
  }

  const compiledTestSierra = json.parse(
    b64toascii(contract)
  );
  const compiledTestCasm = json.parse(
    b64toascii(compiled)
  );
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
