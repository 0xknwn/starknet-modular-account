use core::traits::Into;
use snforge_std::{declare, ContractClassTrait};
use snforge_std::{start_prank, stop_prank, CheatTarget};
use snforge_std::errors::{SyscallResultStringErrorTrait, PanicDataOrString};
use starknet::{ClassHash, ContractAddress};
use openzeppelin::account::interface::{IPublicKeyDispatcherTrait, IPublicKeyDispatcher};
use smartr::component::{IModuleDispatcherTrait, IModuleDispatcher};
use starknet::account::Call;
use openzeppelin::utils::deployments::calculate_contract_address_from_deploy_syscall;

#[test]
fn test_compute_account_address() {
    let publicKey = 0x39d9e6ce352ad4530a0ef5d5a18fd3303c3606a7fa6ac5b620020ad681cc33b;
    let class_hash: ClassHash = 0x53b91f19a9fde9cbef897670da17208b6ce60d8dd4cf301c1f45a976fd6c18f
        .try_into()
        .unwrap();
    let constructorCallData = array![publicKey, 0x10];
    let deployerAddress: ContractAddress = 0x0.try_into().unwrap();

    // use calculate_contract_address_from_deploy_syscall with deployerAddress=0 and salt=publicKey
    // to get the accouny address
    let account_address: ContractAddress = calculate_contract_address_from_deploy_syscall(
        publicKey, class_hash, constructorCallData.span(), deployerAddress
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
    let computed_account_address: ContractAddress = calculate_contract_address_from_deploy_syscall(
        publicKey, account_class_hash, (array![publicKey, 0x10]).span(), deployerAddress
    );
    let (account_address, _) = account_class
        .deploy_at(@array![publicKey, 0x10], computed_account_address)
        .unwrap();
    assert_eq!(account_address, computed_account_address, "account address should match");
    let public_key = IPublicKeyDispatcher { contract_address: account_address }.get_public_key();
    assert_eq!(public_key, publicKey, "public key should match");
}

#[test]
fn test_account_module_call() {
    let core_validator_class = declare("StarkValidator").unwrap();
    let core_validator_class_felt: felt252 = core_validator_class.class_hash.into();
    let account_class = declare("SmartrAccount").unwrap();
    let publicKey = 0x39d9e6ce352ad4530a0ef5d5a18fd3303c3606a7fa6ac5b620020ad681cc33b;
    let constructorCallData = array![core_validator_class_felt, 0x1, publicKey];
    let deployerAddress: ContractAddress = 0x0.try_into().unwrap();
    let computed_account_address: ContractAddress = calculate_contract_address_from_deploy_syscall(
        publicKey, account_class.class_hash, constructorCallData.span(), deployerAddress
    );
    let (account_address, _) = account_class
        .deploy_at(@array![core_validator_class_felt, 0x1, publicKey], computed_account_address)
        .unwrap();
    let account = IModuleDispatcher { contract_address: account_address };
    let call = Call {
        selector: selector!("get_public_keys"), to: account_address, calldata: (array![]).span(),
    };
    let result = account.call_on_module(core_validator_class.class_hash, call);
    assert_eq!(result.len(), 1, "result len should be 1");
    assert_eq!(*result.at(0), publicKey, "result[0] should be 0x1");
}

#[test]
fn test_account_module_execute() {
    let core_validator_class = declare("StarkValidator").unwrap();
    let core_validator_class_felt: felt252 = core_validator_class.class_hash.into();
    let account_class = declare("SmartrAccount").unwrap();
    let publicKey = 0x39d9e6ce352ad4530a0ef5d5a18fd3303c3606a7fa6ac5b620020ad681cc33b;
    let constructorCallData = array![core_validator_class_felt, 0x1, publicKey];
    let deployerAddress: ContractAddress = 0x0.try_into().unwrap();
    let computed_account_address: ContractAddress = calculate_contract_address_from_deploy_syscall(
        publicKey, account_class.class_hash, constructorCallData.span(), deployerAddress
    );
    let (account_address, _) = account_class
        .deploy_at(@array![core_validator_class_felt, 0x1, publicKey], computed_account_address)
        .unwrap();
    let account = IModuleDispatcher { contract_address: account_address };

    let add_public_key_call = Call {
        selector: selector!("add_public_key"),
        to: account_address,
        calldata: (array!['public_key']).span(),
    };
    start_prank(CheatTarget::One(account_address), account_address);
    let result = account.execute_on_module(core_validator_class.class_hash, add_public_key_call);
    stop_prank(CheatTarget::One(account_address));
    assert_eq!(result.len(), 0, "result len should be 0");
    let get_public_keys_call = Call {
        selector: selector!("get_public_keys"), to: account_address, calldata: (array![]).span(),
    };
    let result = account.call_on_module(core_validator_class.class_hash, get_public_keys_call);
    assert_eq!(result.len(), 2, "result len should be 2");
    assert_eq!(*result.at(1), 'public_key', "result[1] should be 'public_key'");
}
