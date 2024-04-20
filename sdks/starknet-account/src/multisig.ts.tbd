import {
  Account,
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
  Call,
  Abi,
  UniversalDetails,
  InvokeFunctionResponse,
  InvocationsSignerDetails,
  ArraySignatureType,
  Signature,
  WeierstrassSignatureType,
} from "starknet";
import { type SessionKeyModule } from "./sessionkey_validator";

export type Module = SessionKeyModule;

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

export class Multisig extends Account {
  public signers: Array<SignerInterface>;

  public module: Module | undefined;

  constructor(
    providerOrOptions: ProviderOptions | ProviderInterface,
    address: string,
    pkOrSigners: Array<Uint8Array> | Array<string> | Array<SignerInterface>,
    module: Module | undefined = undefined,
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
}
