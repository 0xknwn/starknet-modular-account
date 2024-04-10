use starknet::class_hash::ClassHash;

pub fn core_validator() -> ClassHash {
  let class_hash = starknet::class_hash::class_hash_const::<
    0x01e031bf56ab85b41715e9d8cbab6e30324c60ce1f4c02da4c84a752bbc4cdb6
   >();
  class_hash
}
