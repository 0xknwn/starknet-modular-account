use starknet::class_hash::ClassHash;
use core::traits::Into;

pub const core_validator_felt: felt252 =
    0xa30f23324c2a0c8348e3ef1e9dbcdc37f9e602c4937c2fba7f6652e724f5db;

pub fn core_validator() -> ClassHash {
    let classhash: ClassHash = core_validator_felt.try_into().unwrap();
    classhash
}

#[cfg(test)]
mod tests {
    #[test]
    fn test__module_validate__selector() {
        assert_eq!(
            selector!("__module_validate__"),
            0x119c88dea7ff05dbe71c36247fc6682116f6dafa24089373d49aca7b2657017,
            "should match the expected value"
        );
    }
}
