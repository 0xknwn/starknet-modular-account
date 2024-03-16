import { account, config, provider } from "./utils";
import {
  json,
  type CompiledSierra,
  ec,
  CallData,
  hash,
  Account,
} from "starknet";

import fs from "fs";

export const AccountClassHash =
  "0x4b0842449ea4afa6eb97247ecf613d09347fd5344755c66d3469a1b634d17b0";

export const deployClass = async () => {
  const a = account();

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
      .readFileSync("./target/dev/smartr_Account.contract_class.json")
      .toString("ascii")
  );
  const compiledTestCasm = json.parse(
    fs
      .readFileSync("./target/dev/smartr_Account.compiled_contract_class.json")
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

export const computeAccountAddress = () => {
  const c = config();
  const starkKeyPub = ec.starkCurve.getStarkKey(c.accounts[0].privateKey);
  const calldata = CallData.compile({ publicKey: starkKeyPub });
  return hash.calculateContractAddressFromHash(
    starkKeyPub,
    AccountClassHash,
    calldata,
    0
  );
};

export const deployAccount = async () => {
  const c = config();
  const p = provider();
  try {
    const classHash = await p.getClassHashAt(c.accounts[2].address);
    if (classHash == AccountClassHash) {
      return {
        contract_address: c.accounts[2].address,
      };
    }
  } catch (e) {}
  const a = new Account(p, c.accounts[2].address, c.accounts[2].privateKey);
  const starkKeyPub = ec.starkCurve.getStarkKey(c.accounts[0].privateKey);
  const calldata = CallData.compile({ publicKey: starkKeyPub });
  const { transaction_hash, contract_address } = await a.deployAccount({
    classHash: AccountClassHash,
    constructorCalldata: calldata,
    addressSalt: starkKeyPub,
  });
  return {
    ...(await p.waitForTransaction(transaction_hash)),
    contract_address,
  };
};
