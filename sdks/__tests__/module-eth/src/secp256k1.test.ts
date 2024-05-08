import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
const { utils, getPublicKey } = secp256k1;

describe.skip("eth key management", () => {
  let env: string;

  beforeAll(() => {
    env = "devnet";
  });

  it("generates a public key", async () => {
    const privateKey = utils.randomPrivateKey();
    let st1: string = "";
    privateKey.forEach((x) => (st1 += x.toString(16).padStart(2, "0")));

    const publicKey = getPublicKey(privateKey, false);
    let st2: string = "";
    publicKey.forEach((x) => (st2 += x.toString(16).padStart(2, "0")));
    const coordsString = st2.slice(2, st2.length); // removes 0x04
    console.log(
      "privateKey:",
      "0x" + st1,
      "\nx:",
      "0x" + coordsString.slice(0, 64),
      "\ny:",
      "0x" + coordsString.slice(64, 128)
    );
  });
});
