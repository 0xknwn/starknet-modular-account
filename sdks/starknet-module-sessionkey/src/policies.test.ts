import { PolicyManager } from "./policies";
import { hash } from "starknet";

describe("policy management", () => {
  let env: string;
  const manager = new PolicyManager([
    { contractAddress: "0x5", selector: "entry1" },
    { contractAddress: "0x4", selector: "entry2" },
    { contractAddress: "0x3", selector: "entry3" },
    { contractAddress: "0x2", selector: "entry4" },
    { contractAddress: "0x1", selector: "entry5" },
  ]);

  beforeAll(() => {
    env = "devnet";
  });

  it("checks policy root", async () => {
    const transfer = hash.getSelectorFromName("transfer");

    expect(transfer).toBe(
      "0x83afd3f4caedc6eebf44246fe54e38c95e3179a5ec9ea81740eca5b482d12e"
    );
  });

  it("checks policy root", async () => {
    expect(manager.getRoot()).toBe(
      "0x71e75c88605a7aa134055ad4f551c975f9dd554cf07cfff36609b65c5ea606"
    );
  });

  it("generate proof from policy", async () => {
    const proof = manager.getProof({
      contractAddress: "0x5",
      selector: "entry1",
    });

    expect(proof).toEqual([
      "0x5766755d2bdb6a4597f0aacdfd0d947aa87ad04dbd7ac60a0b53cb6e8933f77",
      "0x676838e752ad734562c31908f80c11ede81299ee8f8dca23b56f3940ab4eac4",
      "0xe7770d576068ef5d86313eb46719ba3c063186c4bf4a210f6aa241fb307220",
    ]);
  });
});
