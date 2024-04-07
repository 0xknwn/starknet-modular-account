import fs from "fs";
import { RpcProvider, Account, Contract, Call } from "starknet";
import { ABI as ERC20 } from "./abi/ERC20";
import { ethAddress, strkAddress } from "./addresses";
import { execSync } from "child_process";

type AccountConfig = {
  address: string;
  privateKey: string;
  publicKey: string;
};

type Config = {
  providerURL: string;
  chainID: string;
  accounts: AccountConfig[];
};

export const config = (env: string = "devnet"): Config => {
  if (env && env !== "devnet") {
    return JSON.parse(fs.readFileSync(`.env.${env}.json`, "utf-8"));
  }
  return JSON.parse(fs.readFileSync(".env.devnet.json", "utf-8"));
};

export const provider = (env: string = "devnet") => {
  const c = config(env);
  return new RpcProvider({ nodeUrl: c.providerURL });
};

export const account = (id: number = 0, env: string = "devnet"): Account => {
  const c = config(env);
  const p = provider(env);
  return new Account(p, c.accounts[id].address, c.accounts[id].privateKey);
};

export const ethBalance = async (account: string, env: string = "devnet") => {
  const eth = ethAddress(env);
  const p = provider(env);
  const contract = new Contract(ERC20, eth, p).typedv2(ERC20);
  const amount = await contract.balanceOf(account);
  return amount;
};

export const strkBalance = async (account: string, env: string = "devnet") => {
  const eth = strkAddress(env);
  const p = provider(env);
  const contract = new Contract(ERC20, eth, p).typedv2(ERC20);
  const amount = await contract.balanceOf(account);
  return amount;
};

export const ethTransfer = async (
  account: Account,
  destAddress: string,
  amount: bigint,
  env: string = "devnet"
) => {
  const c = config(env);
  const eth = ethAddress(env);
  const contract = new Contract(ERC20, eth, account).typedv2(ERC20);
  const transferCall: Call = contract.populate("transfer", {
    recipient: destAddress,
    amount,
  });
  const { transaction_hash: transferTxHash } =
    await account.execute(transferCall);
  return await account.waitForTransaction(transferTxHash);
};

export const classHash = (className: string): string => {
  const output = execSync(
    `starkli class-hash ./target/dev/smartr_${className}.contract_class.json`
  );
  return output.toString().trim().replace(/^0x0+/, "0x");
};
