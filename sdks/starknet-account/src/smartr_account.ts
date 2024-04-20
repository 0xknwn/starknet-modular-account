import { accountAddress, deployAccount } from "starknet-test-helpers";
import { Call, CallData, Account, Contract } from "starknet";
import { ABI as SmartrAccountABI } from "./abi/SmartrAccount";

/**
 * Generates a smartr account address based on the provided public key and
 * core validator class hash.
 * @param public_key - The public key associated with the account.
 * @param core_validator - the core validator module class hash.
 * @returns The generated account address.
 */
export const smartrAccountAddress = (
  public_key: string,
  core_validator: string
): string => {
  const calldata = new CallData(SmartrAccountABI).compile("constructor", {
    public_key,
    core_validator,
  });
  return accountAddress("SmartrAccount", public_key, calldata);
};

/**
 * Deploys a smartr account on the StarkNet network.
 *
 * @param deployerAccount - The account used to deploy the smartr account.
 * @param public_key - The public key associated with the account.
 * @param core_validator - the core validator module class hash.
 * @returns A promise that resolves to the deployed smartr account.
 */
export const deploySmartrAccount = async (
  deployerAccount: Account,
  public_key: string,
  core_validator: string
) => {
  const callData = new CallData(SmartrAccountABI).compile("constructor", {
    public_key,
    core_validator,
  });
  return await deployAccount(
    deployerAccount,
    "SmartrAccount",
    public_key,
    callData
  );
};

/**
 * Represents a SmartrAccount.
 */
export class SmartrAccount extends Account {
  /**
   * Upgrades the SmartrAccount to a new class.
   * @param classHash - The hash of the new class.
   * @returns A promise that resolves to the transaction receipt.
   */
  async upgrade(classHash: string) {
    const contract = new Contract(SmartrAccountABI, this.address, this).typedv2(
      SmartrAccountABI
    );
    const upgradeCall: Call = contract.populate("upgrade", {
      new_class_hash: classHash,
    });
    const { transaction_hash: transferTxHash } =
      await this.execute(upgradeCall);
    return await this.waitForTransaction(transferTxHash);
  }

  /**
   * Retrieves the public keys associated with the SmartrAccount.
   * @returns A promise that resolves to the public keys.
   */
  async get_public_keys() {
    const contract = new Contract(SmartrAccountABI, this.address, this).typedv2(
      SmartrAccountABI
    );
    return await contract.get_public_keys();
  }

  /**
   * Retrieves the threshold value of the SmartrAccount.
   * @returns A promise that resolves to the threshold value.
   */
  async get_threshold() {
    const contract = new Contract(SmartrAccountABI, this.address, this).typedv2(
      SmartrAccountABI
    );
    return await contract.get_threshold();
  }

  /**
   * Adds a new public key to the SmartrAccount.
   * @param new_public_key - The new public key to add.
   * @returns A promise that resolves to the transaction receipt.
   */
  async add_public_key(new_public_key: string) {
    const contract = new Contract(SmartrAccountABI, this.address, this).typedv2(
      SmartrAccountABI
    );
    const transferCall: Call = contract.populate("add_public_key", {
      new_public_key: new_public_key,
    });
    const { transaction_hash: transferTxHash } =
      await this.execute(transferCall);
    return await this.waitForTransaction(transferTxHash);
  }

  /**
   * Removes a public key from the SmartrAccount.
   * @param old_public_key - The public key to remove.
   * @returns A promise that resolves to the transaction receipt.
   */
  async remove_public_key(old_public_key: string) {
    const contract = new Contract(SmartrAccountABI, this.address, this).typedv2(
      SmartrAccountABI
    );
    const transferCall: Call = contract.populate("remove_public_key", {
      old_public_key: old_public_key,
    });
    const { transaction_hash: transferTxHash } =
      await this.execute(transferCall);
    return await this.waitForTransaction(transferTxHash);
  }

  /**
   * Sets a new threshold value for the SmartrAccount.
   * @param new_threshold - The new threshold value.
   * @returns A promise that resolves to the transaction receipt.
   */
  async set_threshold(new_threshold: bigint) {
    const contract = new Contract(SmartrAccountABI, this.address, this).typedv2(
      SmartrAccountABI
    );
    const transferCall: Call = contract.populate("set_threshold", {
      new_threshold: new_threshold,
    });
    const { transaction_hash: transferTxHash } =
      await this.execute(transferCall);
    return await this.waitForTransaction(transferTxHash);
  }
}
