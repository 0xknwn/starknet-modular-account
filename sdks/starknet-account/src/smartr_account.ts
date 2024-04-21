import { accountAddress, deployAccount } from "starknet-test-helpers";
import { Call, CallData, Account, Contract } from "starknet";
import { ABI as SmartrAccountABI } from "./abi/SmartrAccount";
import {
  SignerInterface,
  ProviderInterface,
  Signer,
  RPC,
  stark,
  transaction,
  num,
  TransactionType,
} from "starknet";
import type {
  ProviderOptions,
  CairoVersion,
  AllowArray,
  Abi,
  UniversalDetails,
  InvokeFunctionResponse,
  InvocationsSignerDetails,
  ArraySignatureType,
  Signature,
  WeierstrassSignatureType,
} from "starknet";

export type Authorization = {
  accountAddress: string;
  chainId: string;
  selector: string;
  validatorClass: string;
  authKey: string;
  expires: string;
  root: string;
  hash?: string;
  grantorClass?: string;
  signature: string[];
};

export interface AccountModuleInterface {
  request(grantorClass: string): Promise<Authorization>;
  add_signature(signature: string[]): Promise<void>;
  reset(signature: string[]): Promise<void>;
  prefix(): Call;
}

export const signatureToHexArray = (
  signature: Signature
): ArraySignatureType => {
  if (Array.isArray(signature)) {
    return signature as ArraySignatureType;
  }
  try {
    const { r, s } = signature as WeierstrassSignatureType;
    return [
      `0x${num.toBigInt(r).toString(16)}`,
      `0x${num.toBigInt(s).toString(16)}`,
    ] as ArraySignatureType;
  } catch (e) {
    throw new Error(
      "Signature need to be weierstrass.SignatureType or an array for custom"
    );
  }
};

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
  // @todo: move back to one signer and add methods to exchange transactions
  // between account and add signature with the transaction...
  public signers: Array<SignerInterface>;

  public module: AccountModuleInterface | undefined;

  constructor(
    providerOrOptions: ProviderOptions | ProviderInterface,
    address: string,
    pkOrSigners: Array<Uint8Array> | Array<string> | Array<SignerInterface>,
    module: AccountModuleInterface | undefined = undefined,
    cairoVersion?: CairoVersion,
    transactionVersion:
      | typeof RPC.ETransactionVersion.V2
      | typeof RPC.ETransactionVersion.V3 = RPC.ETransactionVersion.V2
  ) {
    super(
      providerOrOptions,
      address,
      pkOrSigners[0],
      cairoVersion,
      transactionVersion
    );
    this.signers = pkOrSigners.map((pkOrSigner) =>
      pkOrSigner instanceof Uint8Array || typeof pkOrSigner === "string"
        ? new Signer(pkOrSigner)
        : pkOrSigner
    );
    this.module = module;
  }

  /**
   * Executes a set of transactions on the StarkNet network.
   *
   * @param transactions - An array of transactions to be executed.
   * @param abis - Optional argument that can be an array of ABIs.
   * @param transactionsDetail - Optional object containing additional details for the transactions.
   * @returns A Promise that resolves to an InvokeFunctionResponse object representing the result of the execution.
   *
   */
  public async execute(
    transactions: AllowArray<Call>,
    transactionsDetail?: UniversalDetails
  ): Promise<InvokeFunctionResponse>;
  public async execute(
    transactions: AllowArray<Call>,
    abis?: Abi[],
    transactionsDetail?: UniversalDetails
  ): Promise<InvokeFunctionResponse>;
  public async execute(
    transactions: AllowArray<Call>,
    arg2?: Abi[] | UniversalDetails,
    transactionsDetail: UniversalDetails = {}
  ): Promise<InvokeFunctionResponse> {
    const details =
      arg2 === undefined || Array.isArray(arg2) ? transactionsDetail : arg2;
    const calls = Array.isArray(transactions) ? transactions : [transactions];
    const nonce = num.toBigInt(details.nonce ?? (await this.getNonce()));
    const version = stark.toTransactionVersion(
      this.getPreferredVersion(
        RPC.ETransactionVersion.V1,
        RPC.ETransactionVersion.V3
      ), // TODO: does this depend on cairo version ?
      details.version
    );

    if (this.module) {
      calls.unshift(this.module.prefix());
    }

    const estimate = await this.getUniversalSuggestedFee(
      version,
      { type: TransactionType.INVOKE, payload: calls },
      {
        ...details,
        version,
      }
    );

    const chainId = await this.getChainId();

    const signerDetails: InvocationsSignerDetails = {
      ...stark.v3Details(details),
      resourceBounds: estimate.resourceBounds,
      walletAddress: this.address,
      nonce,
      maxFee: estimate.maxFee,
      version,
      chainId,
      cairoVersion: await this.getCairoVersion(),
    };

    let signatures = [] as ArraySignatureType;
    for await (const signer of this.signers) {
      const s = signatureToHexArray(
        await signer.signTransaction(calls, signerDetails)
      );
      signatures = signatures.concat(s);
    }

    const calldata = transaction.getExecuteCalldata(
      calls,
      await this.getCairoVersion()
    );

    return this.invokeFunction(
      { contractAddress: this.address, calldata, signature: signatures },
      {
        ...stark.v3Details(details),
        resourceBounds: estimate.resourceBounds,
        nonce,
        maxFee: estimate.maxFee,
        version,
      }
    );
  }

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
    return await this.execute(upgradeCall);
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
    return await this.execute(transferCall);
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
    return await this.execute(transferCall);
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
    return this.execute(transferCall);
  }

  async is_module(class_hash: string) {
    const contract = new Contract(SmartrAccountABI, this.address, this).typedv2(
      SmartrAccountABI
    );
    return await contract.is_module(class_hash);
  }

  async add_module(class_hash: string) {
    const contract = new Contract(SmartrAccountABI, this.address, this).typedv2(
      SmartrAccountABI
    );
    const transferCall: Call = contract.populate("add_module", {
      class_hash: class_hash,
      args: [],
    });
    return await this.execute(transferCall);
  }

  async remove_module(class_hash: string) {
    const contract = new Contract(SmartrAccountABI, this.address, this).typedv2(
      SmartrAccountABI
    );
    const transferCall: Call = contract.populate("remove_module", {
      class_hash: class_hash,
    });
    return await this.execute(transferCall);
  }
}
