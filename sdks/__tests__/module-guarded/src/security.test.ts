import {
  testAccounts,
  default_timeout,
  Counter,
  config,
  ETH,
} from "@0xknwn/starknet-test-helpers";
import {
  declareClass as declareAccountClass,
  classHash as accountClassHash,
  SmartrAccount,
  deployAccount,
  accountAddress,
} from "@0xknwn/starknet-modular-account";
import { RpcProvider, CallData, cairo, Signer } from "starknet";
import {
  declareClass as declareModuleClass,
  classHash as moduleClassHash,
  GuardedValidatorABI,
} from "@0xknwn/starknet-module";

const smartAccountPrivateKey = "0xabcdef";
const initial_EthTransfer = cairo.uint256(10n * 10n ** 15n);

describe("guarded validator security management", () => {
  let env: string;
  let smartrAccount: SmartrAccount;
  let smartAccountPublicKey: string;

  beforeAll(async () => {
    env = "devnet";
    const signer = new Signer(smartAccountPrivateKey);
    smartAccountPublicKey = await signer.getPubKey();
  });

  it(
    `[guarded]: gets the chain id`,
    async () => {
      const conf = config(env);
      const account = testAccounts(conf)[0];
      await account.getChainId();
    },
    default_timeout
  );

  it(
    `[guarded]: deploys the GuardedValidator class`,
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareModuleClass(a, "GuardedValidator");
      expect(c.classHash).toEqual(moduleClassHash("GuardedValidator"));
    },
    default_timeout
  );

  it(
    `[guarded]: deploys the SmartrAccount class`,
    async () => {
      const conf = config(env);
      const a = testAccounts(conf)[0];
      const c = await declareAccountClass(a, "SmartrAccount");
      expect(c.classHash).toEqual(accountClassHash("SmartrAccount"));
    },
    default_timeout
  );

  it(
    `[guarded]: sends ETH to the account address`,
    async () => {
      const conf = config(env);
      const sender = testAccounts(conf)[0];
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      const privateKey = conf.accounts[0].privateKey;
      const moduleValidatorClassHash = moduleClassHash("GuardedValidator");
      const calldata = [moduleValidatorClassHash, "0x1", smartAccountPublicKey];
      const address = accountAddress(
        "SmartrAccount",
        smartAccountPublicKey,
        calldata
      );
      const { transaction_hash } = await ETH(sender).transfer(
        address,
        initial_EthTransfer
      );
      const receipt = await sender.waitForTransaction(transaction_hash);
      expect(receipt.isSuccess()).toEqual(true);
      smartrAccount = new SmartrAccount(p, address, privateKey);
    },
    default_timeout
  );

  it(
    `[guarded]: configures the SmartrAccount with the signer`,
    async () => {
      const conf = config(env);
      const p = new RpcProvider({ nodeUrl: conf.providerURL });
      smartrAccount = new SmartrAccount(
        p,
        smartrAccount.address,
        smartAccountPrivateKey
      );
    },
    default_timeout
  );

  it(
    `[guarded]: deploys a SmartrAccount account`,
    async () => {
      const conf = config(env);
      const moduleValidatorClassHash = moduleClassHash("GuardedValidator");
      const calldata = [moduleValidatorClassHash, "0x1", smartAccountPublicKey];
      const address = await deployAccount(
        smartrAccount,
        "SmartrAccount",
        smartAccountPublicKey,
        calldata
      );
      expect(address).toEqual(
        accountAddress("SmartrAccount", smartAccountPublicKey, calldata)
      );
    },
    default_timeout
  );

  it(
    `[guarded]: checks the SmartAccount public key`,
    async () => {
      const conf = config(env);
      const calldata = new CallData(GuardedValidatorABI);
      const nestedCalldata = calldata.compile("get_public_key", {});
      const c = await smartrAccount.callOnModule(
        moduleClassHash("GuardedValidator"),
        "get_public_key",
        nestedCalldata
      );
      expect(Array.isArray(c)).toBe(true);
      expect(c.length).toEqual(1);
      expect(`0x${c[0].toString(16)}`).toEqual(smartAccountPublicKey);
    },
    default_timeout
  );

  it.todo("[guarded]: checks you cannot run multicalls on modules");

  // Note: a critical issue in the current model is that the guardian is also
  // the one that secures the owner keys and might be able to block the access
  // to the account with its cencorship power
  it.todo("[guarded]: prevents guardian from blocking access to keys");

  it.todo("[guarded]: checks you cannot install a new module right away");

  it.todo("[guarded]: checks you bypass the guardian with a rogue module");

  describe("[guarded]: manages the owner key lost", () => {
    it.todo("[guarded]: requires owner to reset the account");
    it.todo("[guarded]: requires the guardian to request the owner ejection");
    it.todo(
      "[guarded]: requires 1 week to pass before the guardian can eject the owner"
    );
    it.todo("[guarded]: requires the guardian to finalize the owner ejection");
    it.todo("[guarded]: requires the owner to gain access back to the account");
  });

  describe("[guarded]: manages the gardian goes rogue", () => {
    it.todo(
      "[guarded]: could be that the guardian requests to eject the owner"
    );
    it.todo("[guarded]: requires the owner to request the guardian ejection");
    it.todo(
      "[guarded]: could be that the guardian tries to cancel its ejection"
    );
    it.todo("[guarded]: requires the owner to gain access back to the account");
  });

  describe("[guarded]: manages owner key stolen - scenario 1", () => {
    // Note: here we assume the email is not compromized
    it.todo(
      "[guarded]: could be that the rogue owner requests to eject the legit owner"
    );
    it.todo(
      "[guarded]: requires the legit owner to block transactions other than reset"
    );
    it.todo("[guarded]: requires the legit owner request to rotate the keys");
    it.todo(
      "[guarded]: could be that the rogue owner requests to eject the legit request again"
    );
    it.todo(
      "[guarded]: requires the legit owner request to rotate the keys again"
    );
    it.todo(
      "[guarded]: could be that the rogue owner fails to request the legit ejection because of the max attempts"
    );
    it.todo(
      "[guarded]: requires the legit owner to regain access to the account"
    );
  });

  describe("[guarded]: manages owner key stolen - scenario 2", () => {
    // Note: here we assume the email is not compromized
    it.todo(
      "[guarded]: could be that the rogue owner requests to eject the guardian"
    );
    it.todo(
      "[guarded]: requires the guardian to notify the legit owner of the ejection"
    );
    it.todo("[guarded]: requires the legit owner request to rotate the keys");
    it.todo(
      "[guarded]: could be that the rogue owner requests to eject the legit request again"
    );
    it.todo(
      "[guarded]: requires the legit owner request to rotate the keys again"
    );
    it.todo(
      "[guarded]: could be that the rogue owner fails to request the legit ejection because of the max attempts"
    );
    it.todo(
      "[guarded]: requires the legit owner to regain access to the account"
    );
  });

  describe("[guarded]: manages owner key stolen - scenario 3", () => {
    // Note: here we assume the email is not compromized
    it.todo(
      "[guarded]: could be that the rogue owner send token to another account"
    );
  });

  describe("[guarded]: manages owner key stolen - scenario 4", () => {
    // Note: here we assume the email is not compromized
    it.todo(
      "[guarded]: could be that the rogue owner request to change the email"
    );
  });

  describe("[guarded]: manages owner email compromised", () => {});
  // Note: here we assume the owner key is not compromized
  it.todo(
    "[guarded]: could be that the rogue owner requests the guardian to eject the legit owner"
  );
  it.todo("[guarded]: requires the legit owner request to rotate the keys");
});
