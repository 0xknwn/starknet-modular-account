import { ec, merkle, hash } from "starknet";

export type Policy = {
  contractAddress: string;
  selector: string;
};

export type Policies = Policy[];

export class PolicyManager {
  private policies: Policies;
  private tree: merkle.MerkleTree;

  constructor(policies: Policies) {
    this.policies = policies;
    const leaves = policies.map((policy) =>
      ec.starkCurve.pedersen(
        policy.contractAddress,
        hash.getSelectorFromName(policy.selector)
      )
    );
    this.tree = new merkle.MerkleTree(leaves);
  }

  public getRoot(): string {
    return this.tree.root;
  }

  public getProof(policy: Policy): string[] {
    const leaf = ec.starkCurve.pedersen(
      policy.contractAddress,
      hash.getSelectorFromName(policy.selector)
    );
    return this.tree.getProof(leaf);
  }
}
