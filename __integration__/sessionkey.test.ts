import { signature_hash } from "./sessionkey";

describe("sessionkey management", () => {
  let env: string;
  beforeAll(() => {
    env = "devnet";
  });

  it("computes the hash of a string", async () => {
    let code = signature_hash("0x123", "0x1", "0x2", "0x3", "0x4");
    expect(code).toBe(
      "0x7cb25a94548e5e325fc44add9151172921e44963fc55273b7cf6b3956098cef"
    );
  });
});
