import { deployClass, classHash } from "./class";
import { accountAddress, deployAccount, get_public_keys } from "./account";
import { coreValidatorClassHash } from "./core_validator";
import {
  chain,
  config,
  testAccount,
  provider,
  type AccountConfig,
  type ContractConfig,
} from "./utils";
import { udcAddress } from "./addresses";
import {
  swapRouterAddress,
  deploySwapRouterContract,
  tokenAAddress,
  deployTokenAContract,
  tokenBAddress,
  deployTokenBContract,
} from "./sessionkey_swap";
import { Multisig } from "./multisig";
import { add_module, is_module, remove_module } from "./module";
import { timeout } from "./constants";
import { SessionKeyModule, SessionKeyGrantor } from "./sessionkey_validator";
import { Account, ec, hash } from "starknet";
import { hash_auth_message } from "./message";

describe("sessionkey swap", () => {
  let env: string;
  let testAccounts: Account[];
  let targetAccountConfigs: AccountConfig[];
  let targetAccounts: Account[];
  let tokenAContract: ContractConfig;
  let tokenBContract: ContractConfig;
  let SwapRouterContract: ContractConfig;
  let connectedChain: string | undefined;
  let sessionKeyModule: SessionKeyModule | undefined;
  let altProviderURL: string;

  beforeAll(() => {
    env = "devnet";
    const conf = config(env);
    testAccounts = [testAccount(0, conf), testAccount(1, conf)];
    if (!altProviderURL) {
      altProviderURL = conf.providerURL;
    }
    targetAccountConfigs = [
      {
        classHash: classHash("SmartrAccount"),
        address: accountAddress("SmartrAccount", conf.accounts[0].publicKey),
        publicKey: conf.accounts[0].publicKey,
        privateKey: conf.accounts[0].privateKey,
      },
    ];
  });

  it(
    "gets the chain id",
    async () => {
      const conf = config(env);
      connectedChain = await chain(conf.providerURL);
      switch (env) {
        case "sepolia":
          expect(connectedChain).toBe("0x534e5f474f45524c49");
          break;
        default:
          expect(connectedChain).toBe("0x534e5f474f45524c49");
          break;
      }
    },
    timeout
  );

  it(
    "deploys the SwapRouter class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "SwapRouter");
      // expect(c.classHash).toEqual(classHash("SwapRouter"));
      expect(c.classHash).toEqual(
        "0x3be0b9327d4e3921ba653c7dc36115d33850c71664fd00feec8bc299e701c78"
      );
      expect(classHash("SwapRouter")).toEqual(
        "0x3be0b9327d4e3921ba653c7dc36115d33850c71664fd00feec8bc299e701c78"
      );
    },
    timeout
  );

  it(
    "deploys the SwapRouter contract",
    async () => {
      const a = testAccounts[0];
      const c = await deploySwapRouterContract(a);
      SwapRouterContract = {
        classHash: classHash("SwapRouter"),
        address: swapRouterAddress(a.address),
      };
      expect(c.address).toEqual(swapRouterAddress(a.address));
      expect(SwapRouterContract.address).toEqual(
        "0x3abd5450fb4a4cd8283965080728d61546440953742365d59d13b75dbd6f207"
      );
    },
    timeout
  );

  it(
    "deploys the TokenA class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "TokenA");
      expect(c.classHash).toEqual(classHash("TokenA"));
    },
    timeout
  );

  it(
    "deploys the TokenA contract",
    async () => {
      const a = testAccounts[0];
      const c = await deployTokenAContract(swapRouterAddress(a.address), a);
      expect(c.address).toEqual(
        tokenAAddress(a.address, swapRouterAddress(a.address), a.address)
      );
      tokenAContract = {
        classHash: classHash("TokenA"),
        address: c.address,
      };
    },
    timeout
  );

  it("compute and check TokenA address", async () => {
    const a = testAccounts[0];
    const creatorAddress = a.address;
    const recipientAddress = swapRouterAddress(a.address);
    const ownerAddress = a.address;
    const factoryAddress = udcAddress();
    const h = classHash("TokenA");
    const salt = ec.starkCurve.pedersen(creatorAddress, 0);
    // This test just shows how to use calculateContractAddressFromHash for new devs
    // see https://community.starknet.io/t/universal-deployer-contract-proposal/1864
    // to understand the calculateContractAddressFromHash function works
    const res = hash.calculateContractAddressFromHash(
      salt,
      h,
      [recipientAddress, ownerAddress],
      factoryAddress
    );

    expect(res).toBe(
      tokenAAddress(a.address, swapRouterAddress(a.address), a.address)
    );
  });

  it(
    "deploys the TokenB class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "TokenB");
      expect(c.classHash).toEqual(classHash("TokenB"));
    },
    timeout
  );

  it(
    "deploys the TokenB contract",
    async () => {
      const a = testAccounts[0];
      const c = await deployTokenBContract(swapRouterAddress(a.address), a);
      expect(c.address).toEqual(
        tokenBAddress(a.address, swapRouterAddress(a.address), a.address)
      );
      tokenBContract = {
        classHash: classHash("TokenB"),
        address: c.address,
      };
    },
    timeout
  );

  it(
    "deploys the CoreValidator class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "CoreValidator");
      expect(c.classHash).toEqual(`0x${coreValidatorClassHash().toString(16)}`);
    },
    timeout
  );

  it(
    "deploys the Account class",
    async () => {
      const a = testAccounts[0];
      const c = await deployClass(a, "SmartrAccount");
      expect(c.classHash).toEqual(classHash("SmartrAccount"));
    },
    timeout
  );

  it(
    "deploys the account contract",
    async () => {
      const a = testAccounts[0];
      const publicKey = await testAccounts[0].signer.getPubKey();
      const c = await deployAccount(a, "SmartrAccount", publicKey);
      expect(c).toEqual(accountAddress("SmartrAccount", publicKey));
    },
    timeout
  );
});
