use core::traits::Into;
use snforge_std::{declare, ContractClassTrait};
use snforge_std::{start_prank, stop_prank, CheatTarget};
use snforge_std::errors::{SyscallResultStringErrorTrait, PanicDataOrString};
use smartr::utils::compute_contract_address;
use starknet::{ClassHash, ContractAddress};
use openzeppelin::account::interface::{IPublicKeyDispatcherTrait, IPublicKeyDispatcher};
use smartr::account::interface::{IModuleDispatcherTrait, IModuleDispatcher};
use starknet::account::Call;

#[test]
fn test_compute_account_address() {
    let publicKey = 0x39d9e6ce352ad4530a0ef5d5a18fd3303c3606a7fa6ac5b620020ad681cc33b;
    let class_hash: ClassHash = 0x53b91f19a9fde9cbef897670da17208b6ce60d8dd4cf301c1f45a976fd6c18f
        .try_into()
        .unwrap();
    let constructorCallData = array![publicKey, 0x10];
    let deployerAddress: ContractAddress = 0x0.try_into().unwrap();

    // use compute_contract_address with deployerAddress=0 and salt=publicKey
    // to get the accouny address
    let account_address: ContractAddress = compute_contract_address(
        deployerAddress, publicKey, class_hash, constructorCallData
    );
    let account_address_felt = account_address.into();
    assert_eq!(
        account_address_felt,
        0x14f21b3280bec35cf2ef678eef63cbb59f46ba0d00034a07716ca00a6a0fa8d,
        "class hash should match"
    );
}

#[test]
fn test_deploy_simple_account() {
    let account_class = declare("SimpleAccount").unwrap();
    let publicKey = 0x39d9e6ce352ad4530a0ef5d5a18fd3303c3606a7fa6ac5b620020ad681cc33b;
    let deployerAddress: ContractAddress = 0x0.try_into().unwrap();
    let account_class_hash = account_class.class_hash;
    let computed_account_address: ContractAddress = compute_contract_address(
        deployerAddress, publicKey, account_class_hash, array![publicKey, 0x10]
    );
    let (account_address, _) = account_class
        .deploy_at(@array![publicKey, 0x10], computed_account_address)
        .unwrap();
    assert_eq!(account_address, computed_account_address, "account address should match");
    let public_key = IPublicKeyDispatcher { contract_address: account_address }.get_public_key();
    assert_eq!(public_key, publicKey, "public key should match");
    let account_address: ContractAddress = compute_contract_address(deployerAddress, publicKey, class_hash, constructorCallData);
    let account_address_felt = account_address.into(); 
    assert_eq!(account_address_felt, 0x14f21b3280bec35cf2ef678eef63cbb59f46ba0d00034a07716ca00a6a0fa8d, "class hash should match");
}

#[test]
fn test_account_module_call() {
    let core_validator_class = declare("CoreValidator").unwrap();
    let core_validator_class_felt: felt252 = core_validator_class.class_hash.into();
    let account_class = declare("SmartrAccount").unwrap();
    let publicKey = 0x39d9e6ce352ad4530a0ef5d5a18fd3303c3606a7fa6ac5b620020ad681cc33b;
    let constructorCallData = array![core_validator_class_felt, publicKey];
    let deployerAddress: ContractAddress = 0x0.try_into().unwrap();
    let computed_account_address: ContractAddress = compute_contract_address(deployerAddress, publicKey, account_class.class_hash, constructorCallData);
    let (account_address, _) = account_class.deploy_at(@array![core_validator_class_felt, publicKey], computed_account_address).unwrap();
    let account = IModuleDispatcher { contract_address: account_address };
    let call = Call {
        selector: selector!("get_public_keys"),
        to: account_address,
        calldata: (array![]).span(),
    };
    let result = account.call_on_module(core_validator_class.class_hash, call);
    assert_eq!(result.len(), 1, "result len should be 1");
    assert_eq!(*result.at(0), publicKey, "result[0] should be 0x1");
}
