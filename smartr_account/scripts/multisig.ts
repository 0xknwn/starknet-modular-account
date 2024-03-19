import {
  Account,
  transaction,
  Call,
  num,
  stark,
  TransactionType,
  SignerInterface,
  Signer,
} from "starknet";
import type {
  Abi,
  AllowArray,
  UniversalDetails,
  InvokeFunctionResponse,
  InvocationsSignerDetails,
  ProviderOptions,
  ProviderInterface,
  CairoVersion,
  Signature,
  ArraySignatureType,
  WeierstrassSignatureType,
} from "starknet";

import { RPC as api } from "starknet";

const signatureToHexArray = (signature: Signature): ArraySignatureType => {
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

export class MultisigAccount extends Account {
  public altSigner: SignerInterface;

  constructor(
    providerOrOptions: ProviderOptions | ProviderInterface,
    address: string,
    pkOrSigner: Uint8Array | string | SignerInterface,
    altPkOrSigner: Uint8Array | string | SignerInterface,
    cairoVersion?: CairoVersion,
    transactionVersion:
      | typeof api.ETransactionVersion.V2
      | typeof api.ETransactionVersion.V3 = api.ETransactionVersion.V2
  ) {
    super(
      providerOrOptions,
      address,
      pkOrSigner,
      cairoVersion,
      transactionVersion
    );
    this.altSigner =
      typeof altPkOrSigner === "string" || altPkOrSigner instanceof Uint8Array
        ? new Signer(altPkOrSigner)
        : altPkOrSigner;
  }

  public async execute(
    calls: AllowArray<Call>,
    abis: Abi[] | undefined = undefined,
    details: UniversalDetails = {}
  ): Promise<InvokeFunctionResponse> {
    const transactions = Array.isArray(calls) ? calls : [calls];
    const nonce = num.toBigInt(details.nonce ?? (await this.getNonce()));
    const version = stark.toTransactionVersion(
      this.getPreferredVersion(
        api.ETransactionVersion.V1,
        api.ETransactionVersion.V3
      ), // TODO: does this depend on cairo version ?
      details.version
    );

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

    let signature = await this.signer.signTransaction(
      transactions,
      signerDetails,
      abis
    );
    signature = signatureToHexArray(signature);

    let altSignature = [] as ArraySignatureType;
    // @todo: implement altSigner
    // altSignature = (await this.altSigner.signTransaction(
    //   transactions,
    //   signerDetails,
    //   abis
    // ));
    // altSignature = signatureToHexArray(altSignature);

    console.log("signature", signature);
    const signatures = signature.concat(altSignature);

    const calldata = transaction.getExecuteCalldata(
      transactions,
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
