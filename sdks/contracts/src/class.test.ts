import { classHash, classNames } from "./class";
describe("class management", () => {
  const env = "devnet";

  it(`check the Counter class hash`, () => {
    expect(classHash(classNames.Counter)).toEqual(
      "0x06148678c64a3d1a354af0aaff3da7a1d76b17b8ef13d4dc09552063acc1d5fe"
    );
  });
});
