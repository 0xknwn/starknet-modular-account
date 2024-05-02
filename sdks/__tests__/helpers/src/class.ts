import { hash, json, CompiledContract, Account } from "starknet";
import { data as CounterContract } from "./artifacts/Counter-contract";
import { data as CounterCompiled } from "./artifacts/Counter-compiled";
import { data as SimpleAccountContract } from "./artifacts/SimpleAccount-contract";
import { data as SimpleAccountCompiled } from "./artifacts/SimpleAccount-compiled";
import { data as SwapRouterContract } from "./artifacts/SwapRouter-contract";
import { data as SwapRouterCompiled } from "./artifacts/SwapRouter-compiled";
import { data as TokenAContract } from "./artifacts/TokenA-contract";
import { data as TokenACompiled } from "./artifacts/TokenA-compiled";
import { data as TokenBContract } from "./artifacts/TokenB-contract";
import { data as TokenBCompiled } from "./artifacts/TokenB-compiled";

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
  let contract: string = "";
  switch (className) {
    case "Counter":
      contract = CounterContract;
      break;
    case "SimpleAccount":
      contract = SimpleAccountContract;
      break;
    case "SwapRouter":
      contract = SwapRouterContract;
      break;
    case "TokenA":
      contract = TokenAContract;
      break;
    case "TokenB":
      contract = TokenBContract;
      break;
    default:
      throw new Error("Invalid class name");
  }

  const loadedContract: CompiledContract = json.parse(
    Buffer.from(contract, "base64").toString("ascii")
  );
  const { computeContractClassHash } = hash;
  return computeContractClassHash(loadedContract);
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

  let contract: string = "";
  switch (className) {
    case "Counter":
      contract = CounterContract;
      break;
    case "SimpleAccount":
      contract = SimpleAccountContract;
      break;
    case "SwapRouter":
      contract = SwapRouterContract;
      break;
    case "TokenA":
      contract = TokenAContract;
      break;
    case "TokenB":
      contract = TokenBContract;
      break;
    default:
      throw new Error("Invalid class name");
  }

  let compiled: string = "";
  switch (className) {
    case "Counter":
      compiled = CounterCompiled;
      break;
    case "SimpleAccount":
      compiled = SimpleAccountCompiled;
      break;
    case "SwapRouter":
      compiled = SwapRouterCompiled;
      break;
    case "TokenA":
      compiled = TokenACompiled;
      break;
    case "TokenB":
      compiled = TokenBCompiled;
      break;
    default:
      throw new Error("Invalid class name");
  }

  const compiledTestSierra = json.parse(
    Buffer.from(contract, "base64").toString("ascii")
  );
  const compiledTestCasm = json.parse(
    Buffer.from(compiled, "base64").toString("ascii")
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
