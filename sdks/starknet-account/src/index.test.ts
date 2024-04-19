import { describe, expect, it } from "vitest";

describe("account management", () => {
  let x = 1;
  it("check variable is 1", async () => {
    expect(x).toBe(1);
    x++;
  });

  it("check variable is 2", async () => {
    expect(x).toBe(2);
    x++;
  });
});
