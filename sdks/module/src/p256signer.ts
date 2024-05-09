import type { RecoveredSignatureType } from "@noble/curves/abstract/weierstrass";
import { p256 } from "@noble/curves/p256";

import {
  SignerInterface,
  encode,
  num,
  hash,
  CallData,
  stark,
  typedData as typedD,
  transaction,
  uint256,
  RPC,
} from "starknet";
import type {
  Call,
  TypedData,
  Signature,
  DeclareSignerDetails,
  DeployAccountSignerDetails,
  InvocationsSignerDetails,
  Uint256,
  ArraySignatureType,
  V2DeclareSignerDetails,
  V2DeployAccountSignerDetails,
  V2InvocationsSignerDetails,
  V3DeclareSignerDetails,
  V3DeployAccountSignerDetails,
  V3InvocationsSignerDetails,
} from "starknet";

/**
 * Signer for accounts using Ethereum signature
 */
export class p256Signer implements SignerInterface {
  protected pk: string; // hex string without 0x and with an odd number of characters

  constructor(pk: Uint8Array | string) {
    this.pk =
      pk instanceof Uint8Array
        ? encode.buf2hex(pk).padStart(64, "0")
        : encode.removeHexPrefix(num.toHex(pk)).padStart(64, "0");
  }

  /**
   * provides the Ethereum full public key (without parity prefix)
   * @returns an hex string : 64 first characters are Point X coordinate. 64 last characters are Point Y coordinate.
   */
  public async getPubKey(): Promise<string> {
    return encode.addHexPrefix(
      encode
        .buf2hex(p256.getPublicKey(this.pk, false))
        .padStart(130, "0")
        .slice(2)
    );
  }

  public async signMessage(
    typedData: TypedData,
    accountAddress: string
  ): Promise<Signature> {
    const msgHash = typedD.getMessageHash(typedData, accountAddress);
    const signature: RecoveredSignatureType = p256.sign(
      encode.removeHexPrefix(encode.sanitizeHex(msgHash)),
      this.pk
    );
    return this.formatP256Signature(signature);
  }

  public async signTransaction(
    transactions: Call[],
    details: InvocationsSignerDetails
  ): Promise<Signature> {
    const compiledCalldata = transaction.getExecuteCalldata(
      transactions,
      details.cairoVersion
    );
    let msgHash;

    // TODO: How to do generic union discriminator for all like this
    if (
      Object.values(RPC.ETransactionVersion2).includes(details.version as any)
    ) {
      const det = details as V2InvocationsSignerDetails;
      msgHash = hash.calculateInvokeTransactionHash({
        ...det,
        senderAddress: det.walletAddress,
        compiledCalldata,
        version: det.version,
      });
    } else if (
      Object.values(RPC.ETransactionVersion3).includes(details.version as any)
    ) {
      const det = details as V3InvocationsSignerDetails;
      msgHash = hash.calculateInvokeTransactionHash({
        ...det,
        senderAddress: det.walletAddress,
        compiledCalldata,
        version: det.version,
        nonceDataAvailabilityMode: stark.intDAM(det.nonceDataAvailabilityMode),
        feeDataAvailabilityMode: stark.intDAM(det.feeDataAvailabilityMode),
      });
    } else {
      throw Error("unsupported signTransaction version");
    }
    const signature: RecoveredSignatureType = p256.sign(
      encode.removeHexPrefix(encode.sanitizeHex(msgHash)),
      this.pk
    );
    return this.formatP256Signature(signature);
  }

  public async signDeployAccountTransaction(
    details: DeployAccountSignerDetails
  ): Promise<Signature> {
    const compiledConstructorCalldata = CallData.compile(
      details.constructorCalldata
    );
    /*     const version = BigInt(details.version).toString(); */
    let msgHash;

    if (
      Object.values(RPC.ETransactionVersion2).includes(details.version as any)
    ) {
      const det = details as V2DeployAccountSignerDetails;
      msgHash = hash.calculateDeployAccountTransactionHash({
        ...det,
        salt: det.addressSalt,
        constructorCalldata: compiledConstructorCalldata,
        version: det.version,
      });
    } else if (
      Object.values(RPC.ETransactionVersion3).includes(details.version as any)
    ) {
      const det = details as V3DeployAccountSignerDetails;
      msgHash = hash.calculateDeployAccountTransactionHash({
        ...det,
        salt: det.addressSalt,
        compiledConstructorCalldata,
        version: det.version,
        nonceDataAvailabilityMode: stark.intDAM(det.nonceDataAvailabilityMode),
        feeDataAvailabilityMode: stark.intDAM(det.feeDataAvailabilityMode),
      });
    } else {
      throw Error("unsupported signDeployAccountTransaction version");
    }
    const signature: RecoveredSignatureType = p256.sign(
      encode.removeHexPrefix(encode.sanitizeHex(msgHash)),
      this.pk
    );
    return this.formatP256Signature(signature);
  }

  public async signDeclareTransaction(
    // contractClass: ContractClass,  // Should be used once class hash is present in ContractClass
    details: DeclareSignerDetails
  ): Promise<Signature> {
    let msgHash;

    if (
      Object.values(RPC.ETransactionVersion2).includes(details.version as any)
    ) {
      const det = details as V2DeclareSignerDetails;
      msgHash = hash.calculateDeclareTransactionHash({
        ...det,
        version: det.version,
      });
    } else if (
      Object.values(RPC.ETransactionVersion3).includes(details.version as any)
    ) {
      const det = details as V3DeclareSignerDetails;
      msgHash = hash.calculateDeclareTransactionHash({
        ...det,
        version: det.version,
        nonceDataAvailabilityMode: stark.intDAM(det.nonceDataAvailabilityMode),
        feeDataAvailabilityMode: stark.intDAM(det.feeDataAvailabilityMode),
      });
    } else {
      throw Error("unsupported signDeclareTransaction version");
    }

    const signature: RecoveredSignatureType = p256.sign(
      encode.removeHexPrefix(encode.sanitizeHex(msgHash)),
      this.pk
    );
    return this.formatP256Signature(signature);
  }

  /**
   * Serialize the signature in conformity with starknet::eth_signature::Signature
   * @param ethSignature secp256k1 signature from Noble curves library
   * @return an array of felts, representing a Cairo Eth Signature.
   */
  protected formatP256Signature(
    p256Signature: RecoveredSignatureType
  ): ArraySignatureType {
    const r: Uint256 = uint256.bnToUint256(p256Signature.r);
    const s: Uint256 = uint256.bnToUint256(p256Signature.s);
    return [
      num.toHex(r.low),
      num.toHex(r.high),
      num.toHex(s.low),
      num.toHex(s.high),
      num.toHex(p256Signature.recovery),
    ] as ArraySignatureType;
  }
}
