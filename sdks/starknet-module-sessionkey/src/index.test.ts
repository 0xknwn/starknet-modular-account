import { classHash } from "@0xknwn/starknet-test-helpers";

describe("index management", () => {
  it("runs a simple check", async () => {
    expect(classHash()).toBe(`0x12345678`);
  });
});
