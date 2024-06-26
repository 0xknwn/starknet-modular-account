import fs from "fs";
import { RpcProvider, Account } from "starknet";

/**
 * Represents the configuration of an account.
 */
export type AccountConfig = {
  // The class hash.
  classHash?: string;
  // The address.
  address: string;
  // The private key.
  privateKey: string;
  // The public key.
  publicKey: string;
};

/**
 * Represents the configuration for the test helpers.
 */
export type Config = {
  providerURL: string;
  // The array of provided accounts.
  accounts: AccountConfig[];
};

/**
 * Retrieves the configuration based on the specified environment.
 *
 * @param env - The environment for which to retrieve the configuration. Defaults to "devnet".
 * @returns The configuration object.
 */
export const config = (env: string = "devnet"): Config => {
  try {
    return JSON.parse(fs.readFileSync(`../../../.env.${env}.json`, "utf-8"));
  } catch (e) {
    try {
      return JSON.parse(fs.readFileSync(`../../.env.${env}.json`, "utf-8"));
    } catch (e) {
      try {
        return JSON.parse(fs.readFileSync(`../.env.${env}.json`, "utf-8"));
      } catch (e) {
        return JSON.parse(fs.readFileSync(`./.env.${env}.json`, "utf-8"));
      }
    }
  }
};

/**
 * Retrieves the Accounts from the configuration.
 * @param config - The configuration object containing the provider URL and account details.
 * @returns An array of Accounts.
 */
export const testAccounts = (config: Config): Account[] => {
  const provider = new RpcProvider({ nodeUrl: config.providerURL });
  let accounts: Account[] = [];
  for (const configAccount of config.accounts) {
    const account = new Account(
      provider,
      configAccount.address,
      configAccount.privateKey
    );
    accounts.push(account);
  }
  return accounts;
};
