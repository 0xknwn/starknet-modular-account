import fs from "fs";
import { RpcProvider, Account, Contract } from "starknet";
import { ABI as ERC20 } from "./abi/ERC20";
import { ethAddress, strkAddress } from "./addresses";

type AccountConfig = {
  address: string;
  privateKey: string;
  publicKey: string;
};

type Config = {
  providerURL: string;
  chainID: string;
  account: AccountConfig;
};

export const config = (env: string = "devnet"): Config => {
  if (env && env === "devnet") {
    return JSON.parse(fs.readFileSync(".env.devnet.json", "utf-8"));
  }
  return JSON.parse(fs.readFileSync(".env.devnet.json", "utf-8"));
};

export const provider = (env: string = "devnet") => {
  const c = config(env);
  return new RpcProvider({ nodeUrl: c.providerURL });
};

export const account = (env: string = "devnet"): Account => {
  const c = config(env);
  const p = provider(env);
  return new Account(p, c.account.address, c.account.privateKey);
};

export const ethBalance = async (account: string, env: string = "devnet") => {
  const eth = ethAddress(env);
  const p = provider("devnet");
  const contract = new Contract(ERC20, eth, p).typedv2(ERC20);
  const amount = await contract.balanceOf(account);
  return amount;
};

export const strkBalance = async (account: string, env: string = "devnet") => {
  const eth = strkAddress(env);
  const p = provider("devnet");
  const contract = new Contract(ERC20, eth, p).typedv2(ERC20);
  const amount = await contract.balanceOf(account);
  return amount;
};
