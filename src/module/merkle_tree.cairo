use core::pedersen::pedersen;
use core::traits::Into;

pub fn is_valid_root(leaf: felt252, root: felt252, proof: Array<felt252>) -> bool {
    let computed_root = merkle_root(leaf, proof);
    let mut output = false;
    if computed_root == root {
        output = true;
    }
    output
}

fn merkle_root(leaf: felt252, proof: Array<felt252>) -> felt252 {
    let proof_len = proof.len();
    if (proof_len == 0) {
        return leaf;
    }
    let node: felt252 = *proof.at(0);
    let next_leaf = compute_hash(leaf, node);
    let mut next_proof: Array<felt252> = ArrayTrait::<felt252>::new();
    let mut j = 1;
    while j < proof_len {
        next_proof.append(*proof.at(j));
        j += 1;
    };
    merkle_root(next_leaf, next_proof)
}

fn compute_hash(left: felt252, right: felt252) -> felt252 {
    let mut hash: felt252 = 0;
    let left_u256: u256 = left.into();
    let right_u256: u256 = right.into();
    if (left_u256 < right_u256) {
        hash = pedersen(left, right)
    } else {
        hash = pedersen(right, left)
    }
    hash
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_compute_ordered_hash() {
        let hash = super::compute_hash(2, 3);
        assert_eq!(
            hash,
            0x5774fa77b3d843ae9167abd61cf80365a9b2b02218fc2f628494b5bdc9b33b8,
            "hash should match 0x5774fa77b3d843ae9167abd61cf80365a9b2b02218fc2f628494b5bdc9b33b8"
        );
    }

    #[test]
    fn test_compute_reverse_hash() {
        let hash = super::compute_hash(3, 2);
        assert_eq!(
            hash,
            0x5774fa77b3d843ae9167abd61cf80365a9b2b02218fc2f628494b5bdc9b33b8,
            "hash should match 0x5774fa77b3d843ae9167abd61cf80365a9b2b02218fc2f628494b5bdc9b33b8"
        );
    }

    #[test]
    fn test_compute_merkle_root_l1() {
        let leaf = 3;
        let root = super::merkle_root(leaf, array![2]);
        assert_eq!(
            root,
            0x5774fa77b3d843ae9167abd61cf80365a9b2b02218fc2f628494b5bdc9b33b8,
            "root should match 0x5774fa77b3d843ae9167abd61cf80365a9b2b02218fc2f628494b5bdc9b33b8"
        );
    }

    #[test]
    fn test_compute_merkle_root_l2() {
        let leaf = 3;
        let root = super::merkle_root(
            leaf, array![2, 0x57166f9476d0a2d6875124251841eb85a9ae37462fae3cbf7304bcd593938e7,]
        );
        assert_eq!(
            root,
            0x782df77aa09d84b9a8d118e358efda98c7c45c1fd9238933702de807c83b75d,
            "root should match 0x782df77aa09d84b9a8d118e358efda98c7c45c1fd9238933702de807c83b75d"
        );
    }

    #[test]
    fn test_compute_merkle_root_l3() {
        let leaf = 3;
        let root = super::merkle_root(
            leaf,
            array![
                2,
                0x57166f9476d0a2d6875124251841eb85a9ae37462fae3cbf7304bcd593938e7,
                0x49b2777d6f4f3301c487cc4506b7fbb5a2758e99ee1c34211a74a7e288b1ccb
            ]
        );
        assert_eq!(
            root,
            0x382f071ccfa16a06da967fe7713fae94a57eef176a6a9117c00f768fd8637a7,
            "root should match 0x382f071ccfa16a06da967fe7713fae94a57eef176a6a9117c00f768fd8637a7"
        );
    }

    #[test]
    fn test_is_valid_root_l3() {
        let root = 0x382f071ccfa16a06da967fe7713fae94a57eef176a6a9117c00f768fd8637a7;
        let leaf = 3;
        let is_valid = super::is_valid_root(
            leaf,
            root,
            array![
                2,
                0x57166f9476d0a2d6875124251841eb85a9ae37462fae3cbf7304bcd593938e7,
                0x49b2777d6f4f3301c487cc4506b7fbb5a2758e99ee1c34211a74a7e288b1ccb
            ]
        );
        assert!(
            is_valid,
            "root should match the proof"
        );
    }

    #[test]
    fn test_is_not_valid_root_l3() {
        let root = 0x0;
        let leaf = 3;
        let is_valid = super::is_valid_root(
            leaf,
            root,
            array![
                2,
                0x57166f9476d0a2d6875124251841eb85a9ae37462fae3cbf7304bcd593938e7,
                0x49b2777d6f4f3301c487cc4506b7fbb5a2758e99ee1c34211a74a7e288b1ccb
            ]
        );
        assert!(
            !is_valid,
            "root should not match the proof"
        );
    }
}
