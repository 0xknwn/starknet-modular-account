use starknet::class_hash::ClassHash;
use core::traits::Into;

pub const core_validator_felt: felt252 =
    0x5ef687e6ba1e2af9173a89c31de98cba691d109939ff87db146db9b5f03703c;

pub fn core_validator() -> ClassHash {
    let classhash: ClassHash = core_validator_felt.try_into().unwrap();
    classhash
}
