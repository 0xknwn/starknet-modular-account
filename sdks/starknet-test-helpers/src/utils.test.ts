import { config } from "./utils";
import { default_timeout } from "./parameters";
import { RpcProvider } from "starknet";

describe.skip("utilities (helpers)", () => {
  let env = "devnet";

  it("checks the config file", async () => {
    const c = config(env);
    switch (env) {
      case "sepolia":
        expect(c.providerURL).toBe(
          "https://starknet-sepolia.public.blastapi.io"
        );
        expect(c.accounts[0]).not.toBe(undefined);
        expect(c.accounts[0].address).not.toBe(undefined);
        break;
      default:
        expect(c.providerURL).toBe("http://127.0.0.1:5050/rpc");
        expect(c.accounts[0]).not.toBe(undefined);
        expect(c.accounts[0].address).not.toBe(undefined);
        break;
    }
  });

  it(
    "tests chain",
    async () => {
      const c = config(env);
      const provider = new RpcProvider({ nodeUrl: c.providerURL });
      const chainId = await provider.getChainId();
      switch (env) {
        case "sepolia":
          expect(chainId).toBe("0x534e5f5345504f4c4941");
          break;
        default:
          expect(chainId).toBe("0x534e5f5345504f4c4941");
          break;
      }
    },
    default_timeout
  );

  it("checks the provider version", async () => {
    const conf = config(env);
    const provider = new RpcProvider({ nodeUrl: conf.providerURL });
    switch (env) {
      case "sepolia":
        expect(await provider.getSpecVersion()).toBe("0.6.0");
        break;
      default:
        expect(await provider.getSpecVersion()).toBe("0.7.1");
        break;
    }
  });
});
