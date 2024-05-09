import { p256 } from "@noble/curves/p256";
import { secp256k1 } from "@noble/curves/secp256k1";
import { cairo } from "starknet";

describe.skip.each([
  { name: "p256", alg: p256 },
  { name: "secp256k1", alg: secp256k1 },
])("key with algo management", (run) => {
  let env: string;
  const { utils, getPublicKey } = run.alg;

  beforeAll(() => {
    env = "devnet";
  });

  it(`generates a public key for ${run.name}`, async () => {
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
});
