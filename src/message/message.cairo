use starknet::account::Call;
use starknet::{ContractAddress, ClassHash};
use core::pedersen::pedersen;
use core::traits::Into;

pub const STARKNET_DOMAIN_TYPE_HASH: felt252 = selector!("StarkNetDomain(chainId:felt)");
pub const SESSION_TYPE_HASH: felt252 =
    selector!(
        "Session(account:felt,validator:felt,grantor:felt,key:felt,expires:felt,root:merkletree)"
    );
pub const POLICY_TYPE_HASH: felt252 = selector!("Policy(contractAddress:felt,selector:selector)");

pub fn hash_auth_message(
    account_address: ContractAddress,
    validator_class: ClassHash,
    grantor_class: ClassHash,
    authz_key: felt252,
    expires: felt252,
    root: felt252,
    chain_id: felt252
) -> felt252 {
    let chain_hash = array_hash(array![STARKNET_DOMAIN_TYPE_HASH, chain_id]);
    let authz_hash = array_hash(array![SESSION_TYPE_HASH, authz_key, expires, root]);
    let account_address_felt = account_address.try_into().unwrap();
    let validator_class_felt = validator_class.try_into().unwrap();
    let grantor_class_felt = grantor_class.try_into().unwrap();
    array_hash(
        array![
            'StarkNet Message',
            account_address_felt,
            validator_class_felt,
            grantor_class_felt,
            authz_hash,
            chain_hash
        ]
    )
}

fn array_hash(data: Array<felt252>) -> felt252 {
    let mut i = 0;
    let len = data.len();
    let mut v: felt252 = 0;
    while i < len {
        v = pedersen(v, *data.at(i));
        i += 1;
    };
    let felt252_len: felt252 = len.try_into().unwrap();
    v = pedersen(v, felt252_len);
    v
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_short_message() {
        assert_eq!('StarkNet Message', 0x537461726b4e6574204d657373616765, "value should match");
    }

    #[test]
    fn test_type_hash() {
        assert_eq!(
            super::STARKNET_DOMAIN_TYPE_HASH,
            559829204566802802769333095934997962208934200349121683389685917736841749624,
            "domain should match"
        );
        assert_eq!(
            super::SESSION_TYPE_HASH,
            300158337552274304490739948149127820835543586625599349706216852674177038348,
            "session should match"
        );
        assert_eq!(
            super::POLICY_TYPE_HASH,
            1328685774472303838129974879115470406966524039382350505658868861646452794728,
            "policy should match"
        );
    }
}
