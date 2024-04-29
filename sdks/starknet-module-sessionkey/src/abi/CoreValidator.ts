export const ABI = [
  {
    "type": "impl",
    "name": "ConfigureImpl",
    "interface_name": "smartr::module::validator::IConfigure"
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
    "name": "smartr::module::validator::IConfigure",
    "items": [
      {
        "type": "function",
        "name": "call",
        "inputs": [
          {
            "name": "call",
            "type": "core::starknet::account::Call"
          }
        ],
        "outputs": [
          {
            "type": "core::array::Array::<core::felt252>"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "execute",
        "inputs": [
          {
            "name": "call",
            "type": "core::starknet::account::Call"
          }
        ],
        "outputs": [
          {
            "type": "core::array::Array::<core::felt252>"
          }
        ],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "impl",
    "name": "ValidatorImpl",
    "interface_name": "smartr::module::validator::IValidator"
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
      },
      {
        "type": "function",
        "name": "initialize",
        "inputs": [
          {
            "name": "args",
            "type": "core::array::Array::<core::felt252>"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "impl",
    "name": "PublicKeysImpl",
    "interface_name": "smartr::account::interface::IPublicKeys"
  },
  {
    "type": "interface",
    "name": "smartr::account::interface::IPublicKeys",
    "items": [
      {
        "type": "function",
        "name": "add_public_key",
        "inputs": [
          {
            "name": "new_public_key",
            "type": "core::felt252"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_public_keys",
        "inputs": [],
        "outputs": [
          {
            "type": "core::array::Array::<core::felt252>"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_threshold",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u8"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "remove_public_key",
        "inputs": [
          {
            "name": "old_public_key",
            "type": "core::felt252"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "set_threshold",
        "inputs": [
          {
            "name": "new_threshold",
            "type": "core::integer::u8"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
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
    "name": "smartr::presets::core_validator::CoreValidator::Event",
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
