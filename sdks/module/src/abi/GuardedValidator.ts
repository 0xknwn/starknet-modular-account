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
    "name": "GuardedKeysImpl",
    "interface_name": "smartr::modules::guardedvalidator::guardedvalidator::IGuardedKeys"
  },
  {
    "type": "enum",
    "name": "smartr::modules::guardedvalidator::guardedvalidator::EjectionStatus",
    "variants": [
      {
        "name": "None",
        "type": "()"
      },
      {
        "name": "NotReady",
        "type": "()"
      },
      {
        "name": "Ready",
        "type": "()"
      },
      {
        "name": "Expired",
        "type": "()"
      }
    ]
  },
  {
    "type": "struct",
    "name": "smartr::modules::guardedvalidator::guardedvalidator::Ejection",
    "members": [
      {
        "name": "ready_at",
        "type": "core::integer::u64"
      },
      {
        "name": "ejection_type",
        "type": "core::felt252"
      },
      {
        "name": "signer",
        "type": "core::felt252"
      }
    ]
  },
  {
    "type": "interface",
    "name": "smartr::modules::guardedvalidator::guardedvalidator::IGuardedKeys",
    "items": [
      {
        "type": "function",
        "name": "cancel_ejection",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "change_backup_gardian",
        "inputs": [
          {
            "name": "new_guardian",
            "type": "core::felt252"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "change_gardian",
        "inputs": [
          {
            "name": "new_guardian",
            "type": "core::felt252"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "change_owner",
        "inputs": [
          {
            "name": "new_owner",
            "type": "core::felt252"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "finalize_guardian_ejection",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "finalize_owner_ejection",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_ejection_status",
        "inputs": [],
        "outputs": [
          {
            "type": "smartr::modules::guardedvalidator::guardedvalidator::EjectionStatus"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_ejection",
        "inputs": [],
        "outputs": [
          {
            "type": "smartr::modules::guardedvalidator::guardedvalidator::Ejection"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_guardian_backup_key",
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
        "name": "get_guardian_ejection_attempts",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u32"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_guardian_key",
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
        "name": "get_owner_ejection_attempts",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u32"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_owner_key",
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
        "name": "request_guardian_ejection",
        "inputs": [
          {
            "name": "new_guardian",
            "type": "core::felt252"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "request_owner_ejection",
        "inputs": [
          {
            "name": "new_owner",
            "type": "core::felt252"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
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
    "name": "smartr::modules::guardedvalidator::guardedvalidator::GuardedValidator::Event",
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
