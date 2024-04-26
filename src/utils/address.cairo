use core::traits::Into;
use starknet::{ClassHash, ContractAddress};
use core::pedersen::pedersen;

fn computeHashOnElements(data: Array<felt252>) -> felt252 {
    let last = data.len();
    let last_felt: felt252 = last.try_into().unwrap();
    let mut accumulator = 0;
    let mut i: usize = 0;
    while i < last {
        accumulator = pedersen(accumulator, *data.at(i));
        i += 1;
    };
    accumulator = pedersen(accumulator, last_felt);
    accumulator
}

const L2_ADDRESS_UPPER_BOUND: felt252 =
    0x7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00;

pub fn compute_contract_address(
    deployerAddress: ContractAddress, salt: felt252, class_hash: ClassHash, calldata: Array<felt252>
) -> ContractAddress {
    let CONTRACT_ADDRESS_PREFIX = 'STARKNET_CONTRACT_ADDRESS';
    let deployerAddress_felt: felt252 = deployerAddress.into();
    let class_hash_felt: felt252 = class_hash.into();
    let calldata_hash = computeHashOnElements(calldata);
    let account_address_felt = computeHashOnElements(
        array![CONTRACT_ADDRESS_PREFIX, deployerAddress_felt, salt, class_hash_felt, calldata_hash]
    );
    let bounded_address_u256: u256 = account_address_felt.into() % L2_ADDRESS_UPPER_BOUND.into();
    let bounded_address_felt: felt252 = bounded_address_u256.try_into().unwrap();
    let account_address: ContractAddress = bounded_address_felt.try_into().unwrap();
    account_address
}
