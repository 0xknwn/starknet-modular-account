export const ABI = [
  {
    "type": "impl",
    "name": "ValidatorImpl",
    "interface_name": "smartr::component::validator::IValidator"
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
    "name": "smartr::component::validator::IValidator",
    "items": [
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
    "type": "impl",
    "name": "VersionImpl",
    "interface_name": "smartr::component::version::IVersion"
  },
  {
    "type": "interface",
    "name": "smartr::component::version::IVersion",
    "items": [
      {
        "type": "function",
        "name": "get_version",
        "inputs": [],
        "outputs": [
          {
            "type": "core::felt252"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_name",
        "inputs": [],
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
    "type": "impl",
    "name": "CoreValidator",
    "interface_name": "smartr::component::validator::ICoreValidator"
  },
  {
    "type": "interface",
    "name": "smartr::component::validator::ICoreValidator",
    "items": [
      {
        "type": "function",
        "name": "is_valid_signature",
        "inputs": [
          {
            "name": "hash",
            "type": "core::array::Array::<core::felt252>"
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
    "name": "ConfigureImpl",
    "interface_name": "smartr::component::validator::IConfigure"
  },
  {
    "type": "interface",
    "name": "smartr::component::validator::IConfigure",
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
    "name": "PublicKeys",
    "interface_name": "smartr::modules::multisigvalidator::multisigvalidator::IPublicKeys"
  },
  {
    "type": "interface",
    "name": "smartr::modules::multisigvalidator::multisigvalidator::IPublicKeys",
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
    "type": "constructor",
    "name": "constructor",
    "inputs": []
  },
  {
    "type": "event",
    "name": "smartr::component::validator::ValidatorComponent::Event",
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
    "name": "smartr::component::account::AccountComponent::OwnerAdded",
    "kind": "struct",
    "members": [
      {
        "name": "new_owner_guid",
        "type": "core::array::Array::<core::felt252>",
        "kind": "key"
      }
    ]
  },
  {
    "type": "event",
    "name": "smartr::component::account::AccountComponent::OwnerRemoved",
    "kind": "struct",
    "members": [
      {
        "name": "removed_owner_guid",
        "type": "core::array::Array::<core::felt252>",
        "kind": "key"
      }
    ]
  },
  {
    "type": "event",
    "name": "smartr::component::account::AccountComponent::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "OwnerAdded",
        "type": "smartr::component::account::AccountComponent::OwnerAdded",
        "kind": "nested"
      },
      {
        "name": "OwnerRemoved",
        "type": "smartr::component::account::AccountComponent::OwnerRemoved",
        "kind": "nested"
      }
    ]
  },
  {
    "type": "event",
    "name": "smartr::modules::multisigvalidator::multisigvalidator::MultisigValidator::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "ValidatorEvent",
        "type": "smartr::component::validator::ValidatorComponent::Event",
        "kind": "flat"
      },
      {
        "name": "SRC5Event",
        "type": "openzeppelin::introspection::src5::SRC5Component::Event",
        "kind": "flat"
      },
      {
        "name": "AccountEvent",
        "type": "smartr::component::account::AccountComponent::Event",
        "kind": "flat"
      }
    ]
  }
] as const;
