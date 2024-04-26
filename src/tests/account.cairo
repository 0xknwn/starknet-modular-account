use core::traits::Into;
use snforge_std::{declare, ContractClassTrait};
use snforge_std::{start_prank, stop_prank, CheatTarget};
use snforge_std::errors::{SyscallResultStringErrorTrait, PanicDataOrString};
use smartr::utils::compute_contract_address;
use starknet::{ClassHash, ContractAddress};

#[test]
fn test_compute_account_address() {
    let publicKey = 0x39d9e6ce352ad4530a0ef5d5a18fd3303c3606a7fa6ac5b620020ad681cc33b;
    let class_hash: ClassHash = 0x53b91f19a9fde9cbef897670da17208b6ce60d8dd4cf301c1f45a976fd6c18f.try_into().unwrap();
    let constructorCallData = array![publicKey, 0x10];
    let deployerAddress: ContractAddress = 0x0.try_into().unwrap();

    // use compute_contract_address with deployerAddress=0 and salt=publicKey
    // to get the accouny address
    let account_address: ContractAddress = compute_contract_address(deployerAddress, publicKey, class_hash, constructorCallData);
    let account_address_felt = account_address.into(); 
    assert_eq!(account_address_felt, 0x14f21b3280bec35cf2ef678eef63cbb59f46ba0d00034a07716ca00a6a0fa8d, "class hash should match");
}