import type { RecoveredSignatureType } from "@noble/curves/abstract/weierstrass";
import { p256 } from "@noble/curves/p256";
import { secp256k1 } from "@noble/curves/secp256k1";
import { cairo, encode, uint256, Uint256, num } from "starknet";

describe.each([
  {
    name: "p256",
    data: {
      alg: p256,
      privateKey:
        "0x1efecf7ee1e25bb87098baf2aaab0406167aae0d5ea9ba0d31404bf01886bd0e",
      publicKey: [
        "0x097420e05fbc83afe4d73b31890187d0cacf2c3653e27f434701a91625f916c2",
        "0x98a304ff544db99c864308a9b3432324adc6c792181bae33fe7a4cbd48cf263a",
      ],
      hash: "0x419d921d19fbb356ebe8f57be613b8d4d1880c5ad18768ba4e12baa566ec06",
      signature: [
        "0x98fd57ced24ecea3e19b87540589788da1913d80b4b735ea849919d5636cb5e9",
        "0x3e75ae4643235e4dad268f0a480ef3f56a05a126fc09205b0a3a509ba0db9243",
      ],
      splitSignature: [
        "0xa1913d80b4b735ea849919d5636cb5e9",
        "0x98fd57ced24ecea3e19b87540589788d",
        "0x6a05a126fc09205b0a3a509ba0db9243",
        "0x3e75ae4643235e4dad268f0a480ef3f5",
      ],
    },
  },
  {
    name: "p256",
    data: {
      alg: p256,
      privateKey:
        "0x1efecf7ee1e25bb87098baf2aaab0406167aae0d5ea9ba0d31404bf01886bd0e",
      publicKey: [
        "0x097420e05fbc83afe4d73b31890187d0cacf2c3653e27f434701a91625f916c2",
        "0x98a304ff544db99c864308a9b3432324adc6c792181bae33fe7a4cbd48cf263a",
      ],
      hash: "0x1e0cb9e0eb2a8b414df99964673bd493b594c4a627ab031c150ffc81b330706",
      signature: [
        "0xfe4e53a283f4715bba1969dff40227c2ca24a6321a89a02e37a0b830c1a0918e",
        "0x52257a68cfe886341cfaf23841f744230f2af8dadf8bee2e6560c6bbfed8f28f",
      ],
      splitSignature: [
        "0xca24a6321a89a02e37a0b830c1a0918e",
        "0xfe4e53a283f4715bba1969dff40227c2",
        "0xf2af8dadf8bee2e6560c6bbfed8f28f",
        "0x52257a68cfe886341cfaf23841f74423",
      ],
    },
  },
  {
    name: "secp256k1",
    data: {
      alg: secp256k1,
      privateKey:
        "0x45397ee6ca34cb49060f1c303c6cb7ee2d6123e617601ef3e31ccf7bf5bef1f9",
      publicKey: [
        "0x829307f82a1883c2414503ba85fc85037f22c6fc6f80910801f6b01a4131da1e",
        "0x2a23f7bddf3715d11767b1247eccc68c89e11b926e2615268db6ad1af8d8da96",
      ],
      hash: "0x008f882c63d0396d216d57529fe29ad5e70b6cd51b47bd2458b0a4ccb2ba0957",
      signature: [
        "0x82bb3efc0554ec181405468f273b0dbf935cca47182b22da78967d0770f7dcc3",
        "0x6719fef30c11c74add873e4da0e1234deb69eae6a6bd4daa44b816dc199f3e86",
      ],
      splitSignature: [
        "0x935cca47182b22da78967d0770f7dcc3",
        "0x82bb3efc0554ec181405468f273b0dbf",
        "0xeb69eae6a6bd4daa44b816dc199f3e86",
        "0x6719fef30c11c74add873e4da0e1234d",
      ],
    },
  },
])("key with algo management", ({ name, data }) => {
  let env: string;
  const { utils, getPublicKey, sign } = data.alg;

  beforeAll(() => {
    env = "devnet";
  });

  it(`generates a public key for ${name}`, async () => {
    const privateKey = utils.randomPrivateKey();
    let st1: string = "";
    console.log("privateKey:", privateKey);
    privateKey.forEach((x) => (st1 += x.toString(16).padStart(2, "0")));

    const publicKey = getPublicKey(privateKey, false);
    let st2: string = "";
    publicKey.forEach((x) => (st2 += x.toString(16).padStart(2, "0")));
    const coordsString = st2.slice(2, st2.length); // removes 0x04
    const x = cairo.uint256("0x" + coordsString.slice(0, 64));
    const y = cairo.uint256("0x" + coordsString.slice(64, 128));
    console.log(
      "privateKey:",
      "0x" + st1,
      "\nx:",
      "0x" + coordsString.slice(0, 64),
      "\n(x.low: " + x.low + ", x.high: " + x.high + ")",
      "\ny:",
      "0x" + coordsString.slice(64, 128),
      "\n(y.low: " + y.low + ", y.high: " + y.high + ")"
    );
  });

  it.only(`signs a transaction for ${name}`, async () => {
    const keys = encode.addHexPrefix(
      encode
        .buf2hex(getPublicKey(BigInt(data.privateKey), false))
        .padStart(130, "0")
        .slice(2)
    );
    expect(encode.addHexPrefix(keys.slice(2, keys.length - 64))).toBe(
      data.publicKey[0]
    );
    expect(encode.addHexPrefix(keys.slice(66, keys.length))).toBe(
      data.publicKey[1]
    );

    let p256Signature: RecoveredSignatureType = sign(
      encode.removeHexPrefix(encode.sanitizeHex(data.hash)),
      BigInt(data.privateKey)
    );

    expect(`0x${p256Signature.r.toString(16)}`).toBe(data.signature[0]);
    expect(`0x${p256Signature.s.toString(16)}`).toBe(data.signature[1]);

    const x: Uint256 = uint256.bnToUint256(p256Signature.r);
    const y: Uint256 = uint256.bnToUint256(p256Signature.s);
    expect(num.toHex(x.low)).toBe(data.splitSignature[0]);
    expect(num.toHex(x.high)).toBe(data.splitSignature[1]);
    expect(num.toHex(y.low)).toBe(data.splitSignature[2]);
    expect(num.toHex(y.high)).toBe(data.splitSignature[3]);
  });
});
