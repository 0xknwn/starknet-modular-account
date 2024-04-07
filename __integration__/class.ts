import fs from "fs";
import { account, classHash } from "./utils";
import { json, type CompiledSierra } from "starknet";

// deployClass checks if the class is already deployed, and if not, deploys it.
export const deployClass = async (name: string = "Account", env: string = "devnet") => {
  const AccountClassHash = classHash(name);
  const a = account(0, env);

  try {
    const cl = (await a.getClass(AccountClassHash)) as Omit<
      CompiledSierra,
      "sierra_program_debug_info"
    >;
    return {
      classHash: AccountClassHash,
    };
  } catch (e) {}

  const compiledTestSierra = json.parse(
    fs
      .readFileSync(`./target/dev/smartr_${name}.contract_class.json`)
      .toString("ascii")
  );
  const compiledTestCasm = json.parse(
    fs
      .readFileSync(`./target/dev/smartr_${name}.compiled_contract_class.json`)
      .toString("ascii")
  );
  try {
    const declareResponse = await a.declare({
      contract: compiledTestSierra,
      casm: compiledTestCasm,
    });
    return {
      ...(await a.waitForTransaction(declareResponse.transaction_hash)),
      classHash: declareResponse.class_hash,
    };
  } catch (e) {}
  throw new Error("Failed to deploy class");
};
