import { account } from "./utils";
import { json, type CompiledSierra, Contract, Call } from "starknet";
import { ABI as CounterABI } from "./abi/Counter";

import fs from "fs";

const CounterClassHash =
  "0x6bb84ab149988a8aaec07001d5b81acf2a1ad8b8d001ef76d240a929949f4f9";
const CounterContractAddress =
  "0x05399bea17614cfbaf83c9bc194335e1f24af7e4ba0588bebc3ad237ab5ad7d0";

export const deployClass = async () => {
  const a = account();

  try {
    const cl = (await a.getClass(CounterClassHash)) as Omit<
      CompiledSierra,
      "sierra_program_debug_info"
    >;
    return {
      classHash: CounterClassHash,
    };
  } catch (e) {}

  const compiledTestSierra = json.parse(
    fs
      .readFileSync("./target/dev/smartr_Counter.contract_class.json")
      .toString("ascii")
  );
  const compiledTestCasm = json.parse(
    fs
      .readFileSync("./target/dev/smartr_Counter.compiled_contract_class.json")
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
  return {
    classHash: "0x0",
  };
};

export const deployContract = async (): Promise<Contract> => {
  const a = account();

  try {
    const v = await a.getContractVersion(CounterContractAddress);
    if (v.cairo == "1" && v.compiler == "2") {
      return new Contract(CounterABI, CounterContractAddress, a);
    }
  } catch (e) {}
  const deployResponse = await a.deployContract({
    classHash: CounterClassHash,
    constructorCalldata: [account().address],
    salt: "0x0",
  });
  await a.waitForTransaction(deployResponse.transaction_hash);
  return new Contract(CounterABI, deployResponse.contract_address, a);
};

export const increment = async () => {
  const a = account();
  const contract = new Contract(CounterABI, CounterContractAddress, a).typedv2(
    CounterABI
  );
  const transferCall: Call = contract.populate("increment", {});
  const { transaction_hash: transferTxHash } = await a.execute(transferCall);
  return await a.waitForTransaction(transferTxHash);
};

export const reset = async (id: number = 0, env: string = "devnet") => {
  const a = account(id, env);
  const contract = new Contract(CounterABI, CounterContractAddress, a).typedv2(
    CounterABI
  );
  const transferCall: Call = contract.populate("reset", {});
  const { transaction_hash: transferTxHash } = await a.execute(transferCall);
  return await a.waitForTransaction(transferTxHash);
};

export const get = async () => {
  const a = account();
  const contract = new Contract(CounterABI, CounterContractAddress, a).typedv2(
    CounterABI
  );
  return await contract.get();
};
