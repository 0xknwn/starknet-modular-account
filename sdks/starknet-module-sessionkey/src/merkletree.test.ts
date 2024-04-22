import { merkle, ec } from "starknet";

describe("merkle tree management", () => {
  let env: string;

  beforeAll(() => {
    env = "devnet";
  });

  it("checks merkle tree of 5 keys", async () => {
    const tree = new merkle.MerkleTree(["0x5", "0x4", "0x3", "0x2", "0x1"]);
    expect(tree.root).toBe(
      "0x382f071ccfa16a06da967fe7713fae94a57eef176a6a9117c00f768fd8637a7"
    );
    expect(tree.branches).toEqual([
      [
        "0x57166f9476d0a2d6875124251841eb85a9ae37462fae3cbf7304bcd593938e7",
        "0x5774fa77b3d843ae9167abd61cf80365a9b2b02218fc2f628494b5bdc9b33b8",
        "0x46c9aeb066cc2f41c7124af30514f9e607137fbac950524f5fdace5788f9d43",
      ],
      [
        "0x782df77aa09d84b9a8d118e358efda98c7c45c1fd9238933702de807c83b75d",
        "0x49b2777d6f4f3301c487cc4506b7fbb5a2758e99ee1c34211a74a7e288b1ccb",
      ],
    ]);
  });

  it("checks merkle tree of 5 keys in another order", async () => {
    const tree = new merkle.MerkleTree(["0x4", "0x5", "0x2", "0x3", "0x1"]);
    expect(tree.branches).toEqual([
      [
        "0x57166f9476d0a2d6875124251841eb85a9ae37462fae3cbf7304bcd593938e7",
        "0x5774fa77b3d843ae9167abd61cf80365a9b2b02218fc2f628494b5bdc9b33b8",
        "0x46c9aeb066cc2f41c7124af30514f9e607137fbac950524f5fdace5788f9d43",
      ],
      [
        "0x782df77aa09d84b9a8d118e358efda98c7c45c1fd9238933702de807c83b75d",
        "0x49b2777d6f4f3301c487cc4506b7fbb5a2758e99ee1c34211a74a7e288b1ccb",
      ],
    ]);
    expect(tree.root).toBe(
      "0x382f071ccfa16a06da967fe7713fae94a57eef176a6a9117c00f768fd8637a7"
    );
  });

  it("checks merkle tree of 5 keys in another order", async () => {
    const tree = new merkle.MerkleTree(["0x2", "0x3", "0x4", "0x5", "0x1"]);
    expect(tree.branches).toEqual([
      [
        "0x5774fa77b3d843ae9167abd61cf80365a9b2b02218fc2f628494b5bdc9b33b8",
        "0x57166f9476d0a2d6875124251841eb85a9ae37462fae3cbf7304bcd593938e7",
        "0x46c9aeb066cc2f41c7124af30514f9e607137fbac950524f5fdace5788f9d43",
      ],
      [
        "0x782df77aa09d84b9a8d118e358efda98c7c45c1fd9238933702de807c83b75d",
        "0x49b2777d6f4f3301c487cc4506b7fbb5a2758e99ee1c34211a74a7e288b1ccb",
      ],
    ]);
    expect(tree.root).toBe(
      "0x382f071ccfa16a06da967fe7713fae94a57eef176a6a9117c00f768fd8637a7"
    );
  });

  it("checks merkle tree of 3 keys", async () => {
    const tree = new merkle.MerkleTree([
      "0x5774fa77b3d843ae9167abd61cf80365a9b2b02218fc2f628494b5bdc9b33b8",
      "0x57166f9476d0a2d6875124251841eb85a9ae37462fae3cbf7304bcd593938e7",
      "0x46c9aeb066cc2f41c7124af30514f9e607137fbac950524f5fdace5788f9d43",
    ]);
    expect(tree.branches).toEqual([
      [
        "0x782df77aa09d84b9a8d118e358efda98c7c45c1fd9238933702de807c83b75d",
        "0x49b2777d6f4f3301c487cc4506b7fbb5a2758e99ee1c34211a74a7e288b1ccb",
      ],
    ]);
    expect(tree.root).toBe(
      "0x382f071ccfa16a06da967fe7713fae94a57eef176a6a9117c00f768fd8637a7"
    );
  });

  it("checks merkle tree of 4 keys in another order", async () => {
    const tree = new merkle.MerkleTree([
      "0x57166f9476d0a2d6875124251841eb85a9ae37462fae3cbf7304bcd593938e7",
      "0x5774fa77b3d843ae9167abd61cf80365a9b2b02218fc2f628494b5bdc9b33b8",
      "0x46c9aeb066cc2f41c7124af30514f9e607137fbac950524f5fdace5788f9d43",
      "0x0",
    ]);
    expect(tree.branches).toEqual([
      [
        "0x782df77aa09d84b9a8d118e358efda98c7c45c1fd9238933702de807c83b75d",
        "0x49b2777d6f4f3301c487cc4506b7fbb5a2758e99ee1c34211a74a7e288b1ccb",
      ],
    ]);
    expect(tree.root).toBe(
      "0x382f071ccfa16a06da967fe7713fae94a57eef176a6a9117c00f768fd8637a7"
    );
  });

  it("checks merkle tree of 2 keys", async () => {
    const tree = new merkle.MerkleTree([
      "0x782df77aa09d84b9a8d118e358efda98c7c45c1fd9238933702de807c83b75d",
      "0x49b2777d6f4f3301c487cc4506b7fbb5a2758e99ee1c34211a74a7e288b1ccb",
    ]);
    expect(tree.branches).toEqual([]);
    expect(tree.root).toBe(
      "0x382f071ccfa16a06da967fe7713fae94a57eef176a6a9117c00f768fd8637a7"
    );
  });

  it("checks merkle tree of 2 keys in another order", async () => {
    const tree = new merkle.MerkleTree([
      "0x49b2777d6f4f3301c487cc4506b7fbb5a2758e99ee1c34211a74a7e288b1ccb",
      "0x782df77aa09d84b9a8d118e358efda98c7c45c1fd9238933702de807c83b75d",
    ]);
    expect(tree.branches).toEqual([]);
    expect(tree.root).toBe(
      "0x382f071ccfa16a06da967fe7713fae94a57eef176a6a9117c00f768fd8637a7"
    );
  });

  it("checks merkle tree of 1 key", async () => {
    const v = ec.starkCurve.pedersen(
      "0x49b2777d6f4f3301c487cc4506b7fbb5a2758e99ee1c34211a74a7e288b1ccb",
      "0x782df77aa09d84b9a8d118e358efda98c7c45c1fd9238933702de807c83b75d"
    );
    expect(v).toBe(
      "0x382f071ccfa16a06da967fe7713fae94a57eef176a6a9117c00f768fd8637a7"
    );
  });

  it("checks merkle tree of 1 key", async () => {
    const v = ec.starkCurve.pedersen("0x0", "0x1");
    expect(v).toBe(
      "0x46c9aeb066cc2f41c7124af30514f9e607137fbac950524f5fdace5788f9d43"
    );
  });

  it("checks and recomputes merkle tree proof for 0x1", async () => {
    const tree = new merkle.MerkleTree(["0x5", "0x4", "0x3", "0x2", "0x1"]);
    const proof = tree.getProof("0x1");
    expect(proof).toEqual([
      "0x0",
      "0x0",
      "0x782df77aa09d84b9a8d118e358efda98c7c45c1fd9238933702de807c83b75d",
    ]);

    let v = ec.starkCurve.pedersen("0x0", "0x1");
    expect(v).toBe(
      "0x46c9aeb066cc2f41c7124af30514f9e607137fbac950524f5fdace5788f9d43"
    );
    v = ec.starkCurve.pedersen("0x0", v);
    expect(v).toBe(
      "0x49b2777d6f4f3301c487cc4506b7fbb5a2758e99ee1c34211a74a7e288b1ccb"
    );
    v = ec.starkCurve.pedersen(
      v,
      "0x782df77aa09d84b9a8d118e358efda98c7c45c1fd9238933702de807c83b75d"
    );
    expect(v).toBe(
      "0x382f071ccfa16a06da967fe7713fae94a57eef176a6a9117c00f768fd8637a7"
    );
  });

  it("checks and recomputes merkle tree proof for 0x3", async () => {
    const tree = new merkle.MerkleTree(["0x5", "0x4", "0x3", "0x2", "0x1"]);
    const proof = tree.getProof("0x3");
    expect(proof).toEqual([
      "0x2",
      "0x57166f9476d0a2d6875124251841eb85a9ae37462fae3cbf7304bcd593938e7",
      "0x49b2777d6f4f3301c487cc4506b7fbb5a2758e99ee1c34211a74a7e288b1ccb",
    ]);

    let v = ec.starkCurve.pedersen("0x2", "0x3");
    expect(v).toBe(
      "0x5774fa77b3d843ae9167abd61cf80365a9b2b02218fc2f628494b5bdc9b33b8"
    );
    v = ec.starkCurve.pedersen(
      "0x57166f9476d0a2d6875124251841eb85a9ae37462fae3cbf7304bcd593938e7",
      v
    );
    expect(v).toBe(
      "0x782df77aa09d84b9a8d118e358efda98c7c45c1fd9238933702de807c83b75d"
    );
    v = ec.starkCurve.pedersen(
      "0x49b2777d6f4f3301c487cc4506b7fbb5a2758e99ee1c34211a74a7e288b1ccb",
      v
    );
    expect(v).toBe(
      "0x382f071ccfa16a06da967fe7713fae94a57eef176a6a9117c00f768fd8637a7"
    );
  });
});
