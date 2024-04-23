import { PolicyManager } from "./policies";
import { hash, ec } from "starknet";

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

  it("check proof matches", async () => {
    const v = ec.starkCurve.pedersen(
      "0x22b0eb356391ceaceb2eacb91020519d25e37454bc90dca8cc90f18f12e041d",
      "0x7a44dde9fea32737a5cf3f9683b3235138654aa2d189f6fe44af37a61dc60d"
    );
    expect(v).toBe(
      "0x619bb1d6b999733261f77da5e4a7c17490e2cebee0634ea4fa246a03dfe545e"
    );
    const w = ec.starkCurve.pedersen(
      v,
      "0x7f667c5eade89360abf17e94c16eb3569d0722812c5dff1e551611e02ba6301"
    );
    expect(w).toBe(
      "0x27483a1ea35e8bfeb07f2c90f4c4049fdae3b9cc5f9ddd68be0680add00b695"
    );
  });
});
