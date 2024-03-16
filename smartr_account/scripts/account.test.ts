import { deployClass, computeAccountAddress, deployAccount } from "./account";
import { config, ethBalance, ethTransfer } from "./utils";
import { increment, get, reset } from "./counter";

test("deploy account class", async () => {
  const c = await deployClass();
  expect(c.classHash).toEqual(
    "0x487826eee874f97e2e0bb46af10cf81ebefae27f41eff9c70b76c801e6139c4"
  );
}, 20000);

test("compute account address", async () => {
  const c = computeAccountAddress();
  expect(c).toEqual(
    "0x3ebf0c708588669e87399e149f1b7caae4c880e3be5a1f01740015edfffa85"
  );
});

test("transfer eth to new account", async () => {
  const c = config();
  const initialAmount = (await ethBalance(c.accounts[0].address)) as bigint;
  const receipt = await ethTransfer(0, 2, 10n ** 16n);
  expect(receipt.execution_status).toBe("SUCCEEDED");
  const finalAmount = (await ethBalance(c.accounts[0].address)) as bigint;
  expect(initialAmount - finalAmount).toBeGreaterThanOrEqual(10n ** 16n);
}, 20000);

test("deploy account contract", async () => {
  const c = await deployAccount();
  expect(c.contract_address).toEqual(
    "0x3ebf0c708588669e87399e149f1b7caae4c880e3be5a1f01740015edfffa85"
  );
}, 120000);

test("reset counter", async () => {
  const c = await reset(0);
  expect(c.execution_status).toBe("SUCCEEDED");
}, 120000);

test("increment counter", async () => {
  const c = await increment(2);
  expect(c.execution_status).toEqual("SUCCEEDED");
}, 120000);

test("read counter", async () => {
  const c = await get(2);
  expect(c).toBeGreaterThan(0n);
}, 120000);
