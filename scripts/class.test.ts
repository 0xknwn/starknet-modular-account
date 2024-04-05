import { deployClass } from "./class";
import { classHash } from "./utils";

test("deploy simple account class", async () => {
  const c = await deployClass("SimpleAccount");
  expect(c.classHash).toEqual(classHash("SimpleAccount"));
}, 20000);
