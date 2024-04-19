import { Account } from "./index";

describe("account management", () => {
  it("checks the account can be instanciated", async () => {
    const account = new Account();
    expect(account.log("xyz")).toBeUndefined();
  });
});
