export const ABI = [
  {
    "type": "impl",
    "name": "ValidatorImpl",
    "interface_name": "smartr::module::validator::IValidator"
  },
  {
    "type": "struct",
    "name": "core::array::Span::<core::felt252>",
    "members": [
      {
        "name": "snapshot",
        "type": "@core::array::Array::<core::felt252>"
      }
    ]
  },
  {
    "type": "struct",
    "name": "core::starknet::account::Call",
    "members": [
      {
        "name": "to",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "selector",
        "type": "core::felt252"
      },
      {
        "name": "calldata",
        "type": "core::array::Span::<core::felt252>"
      }
    ]
  },
  {
    "type": "interface",
    "name": "smartr::module::validator::IValidator",
    "items": [
      {
        "type": "function",
        "name": "is_valid_signature",
        "inputs": [
          {
            "name": "hash",
            "type": "core::felt252"
          },
          {
            "name": "signature",
            "type": "core::array::Array::<core::felt252>"
          }
        ],
        "outputs": [
          {
            "type": "core::felt252"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "validate",
        "inputs": [
          {
            "name": "grantor_class",
            "type": "core::starknet::class_hash::ClassHash"
          },
          {
            "name": "calls",
            "type": "core::array::Array::<core::starknet::account::Call>"
          }
        ],
        "outputs": [
          {
            "type": "core::felt252"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "type": "event",
    "name": "smartr::module::validator::ValidatorComponent::Event",
    "kind": "enum",
    "variants": []
  },
  {
    "type": "event",
    "name": "openzeppelin::introspection::src5::SRC5Component::Event",
    "kind": "enum",
    "variants": []
  },
  {
    "type": "event",
    "name": "smartr::account::account::AccountComponent::OwnerAdded",
    "kind": "struct",
    "members": [
      {
        "name": "new_owner_guid",
        "type": "core::felt252",
        "kind": "key"
      }
    ]
  },
  {
    "type": "event",
    "name": "smartr::account::account::AccountComponent::OwnerRemoved",
    "kind": "struct",
    "members": [
      {
        "name": "removed_owner_guid",
        "type": "core::felt252",
        "kind": "key"
      }
    ]
  },
  {
    "type": "event",
    "name": "smartr::account::account::AccountComponent::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "OwnerAdded",
        "type": "smartr::account::account::AccountComponent::OwnerAdded",
        "kind": "nested"
      },
      {
        "name": "OwnerRemoved",
        "type": "smartr::account::account::AccountComponent::OwnerRemoved",
        "kind": "nested"
      }
    ]
  },
  {
    "type": "event",
    "name": "smartr::presets::sessionkey_validator::SessionKeyValidator::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "ValidatorEvent",
        "type": "smartr::module::validator::ValidatorComponent::Event",
        "kind": "flat"
      },
      {
        "name": "SRC5Event",
        "type": "openzeppelin::introspection::src5::SRC5Component::Event",
        "kind": "flat"
      },
      {
        "name": "AccountEvent",
        "type": "smartr::account::account::AccountComponent::Event",
        "kind": "flat"
      }
    ]
  }
] as const;
