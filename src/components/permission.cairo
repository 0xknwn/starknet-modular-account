use starknet::ContractAddress;
use core::pedersen::pedersen;
use core::traits::Into;

fn sessionkey_hash(
  account: ContractAddress,
  session_key: felt252,
  expires: felt252,
  merkle_root: felt252,
  chain_id: felt252) -> felt252 {
    let key = pedersen(pedersen(session_key, expires), merkle_root);
    let account_felt = account.try_into().unwrap();
    let v = pedersen(pedersen(pedersen('StarkNet Message', account_felt), key), chain_id);
    v
}

use snforge_std::errors::{SyscallResultStringErrorTrait, PanicDataOrString};
#[cfg(test)]
mod tests {
    use starknet::contract_address_const;
    use starknet::ContractAddress;
    use super::sessionkey_hash;
    use core::pedersen::pedersen;

    #[test]
    fn test_short_message() {
      assert_eq!('StarkNet Message', 0x537461726b4e6574204d657373616765, "value should match");
    }

    #[test]
    fn test_simple_perdersen() {
      assert_eq!(pedersen(110930206544689809660069706067448260453, 1), 0x739cb54f1cb93cd9cdea64d693188ab344c735787d3e98dc2ca35a031476b6a, "value should match");
    }

    #[test]
    fn test_sessionkey_hash() {
        let account: ContractAddress = contract_address_const::<0x123>();
        let session_key: felt252 = 0x1;
        let expires: felt252 = 0x2;
        let merkle_root: felt252 = 0x3;
        let chain_id: felt252 = 0x4;
        let hash = sessionkey_hash(account, session_key, expires, merkle_root, chain_id);
        assert_eq!(hash, 0x7cb25a94548e5e325fc44add9151172921e44963fc55273b7cf6b3956098cef, "value should match");
    }
}
