import fs from "fs";
import { json, type CompiledSierra, Account } from "starknet";
import { execSync } from "child_process";

export const classHash = (className: string): string => {
  const output = execSync(
    `starkli class-hash ./target/dev/smartr_${className}.contract_class.json`
  );
  return output.toString().trim().replace(/^0x0+/, "0x");
};

// deployClass checks if the class is already deployed, and if not, deploys it.
export const deployClass = async (
  a: Account,
  name: string = "SmartrAccount"
) => {
  const AccountClassHash = classHash(name);

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
