import fs from "fs";
import { RpcProvider, Account, Contract, Call } from "starknet";
import { ABI as ERC20 } from "./abi/ERC20";
import { ethAddress, strkAddress } from "./addresses";

export type AccountConfig = {
  classHash?: string;
  address: string;
  privateKey: string;
  publicKey: string;
};

export type ContractConfig = {
  classHash?: string;
  address: string;
};

export type Config = {
  providerURL: string;
  accounts: AccountConfig[];
};

export const config = (env: string = "devnet"): Config => {
  if (env && env !== "devnet") {
    return JSON.parse(fs.readFileSync(`.env.${env}.json`, "utf-8"));
  }
  return JSON.parse(fs.readFileSync(".env.devnet.json", "utf-8"));
};

export const provider = (url?: string) => {
  if (!url) {
    config();
    url = config().providerURL;
  }
  return new RpcProvider({ nodeUrl: url });
};

export const testAccount = (id: number = 0, c?: Config): Account => {
  if (!c) {
    c = config();
  }
  const p = provider(c.providerURL);
  return new Account(p, c.accounts[id].address, c.accounts[id].privateKey);
};

export const chain = async (url: string) => {
  const p = provider(url);
  return (await p.getChainId()).toString();
};

export const ethBalance = async (account: string, c?: Config) => {
  if (!c) {
    c = config();
  }
  const eth = ethAddress();
  const p = provider(c.providerURL);
  const contract = new Contract(ERC20, eth, p).typedv2(ERC20);
  const amount = await contract.balanceOf(account);
  return amount;
};

export const strkBalance = async (account: string, c?: Config) => {
  if (!c) {
    c = config();
  }
  const eth = strkAddress();
  const p = provider(c.providerURL);
  const contract = new Contract(ERC20, eth, p).typedv2(ERC20);
  const amount = await contract.balanceOf(account);
  return amount;
};

export const ethTransfer = async (
  account: Account,
  destAddress: string,
  amount: bigint
) => {
  const eth = ethAddress();
  const contract = new Contract(ERC20, eth, account).typedv2(ERC20);
  const transferCall: Call = contract.populate("transfer", {
    recipient: destAddress,
    amount,
  });
  const { transaction_hash: transferTxHash } =
    await account.execute(transferCall);
  return await account.waitForTransaction(transferTxHash);
};
