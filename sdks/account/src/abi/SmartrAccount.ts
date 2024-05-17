export const ABI = [
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
    "name": "UpgradeableImpl",
    "interface_name": "openzeppelin::upgrades::interface::IUpgradeable"
  },
  {
    "type": "interface",
    "name": "openzeppelin::upgrades::interface::IUpgradeable",
    "items": [
      {
        "type": "function",
        "name": "upgrade",
        "inputs": [
          {
            "name": "new_class_hash",
            "type": "core::starknet::class_hash::ClassHash"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "impl",
    "name": "SRC6Impl",
    "interface_name": "smartr::component::account::ISRC6"
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
    "name": "smartr::component::account::ISRC6",
    "items": [
      {
        "type": "function",
        "name": "__execute__",
        "inputs": [
          {
            "name": "calls",
            "type": "core::array::Array::<core::starknet::account::Call>"
          }
        ],
        "outputs": [
          {
            "type": "core::array::Array::<core::array::Span::<core::felt252>>"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "__validate__",
        "inputs": [
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
      }
    ]
  },
  {
    "type": "impl",
    "name": "DeclarerImpl",
    "interface_name": "smartr::component::account::IDeclarer"
  },
  {
    "type": "interface",
    "name": "smartr::component::account::IDeclarer",
    "items": [
      {
        "type": "function",
        "name": "__validate_declare__",
        "inputs": [
          {
            "name": "class_hash",
            "type": "core::felt252"
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
    "name": "DeployableImpl",
    "interface_name": "smartr::component::account::IDeployable"
  },
  {
    "type": "interface",
    "name": "smartr::component::account::IDeployable",
    "items": [
      {
        "type": "function",
        "name": "__validate_deploy__",
        "inputs": [
          {
            "name": "class_hash",
            "type": "core::felt252"
          },
          {
            "name": "contract_address_salt",
            "type": "core::felt252"
          },
          {
            "name": "core_validator",
            "type": "core::felt252"
          },
          {
            "name": "public_key",
            "type": "core::array::Array::<core::felt252>"
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
    "name": "ModuleImpl",
    "interface_name": "smartr::component::account::IModule"
  },
  {
    "type": "enum",
    "name": "core::bool",
    "variants": [
      {
        "name": "False",
        "type": "()"
      },
      {
        "name": "True",
        "type": "()"
      }
    ]
  },
  {
    "type": "interface",
    "name": "smartr::component::account::IModule",
    "items": [
      {
        "type": "function",
        "name": "__module_validate__",
        "inputs": [
          {
            "name": "calldata",
            "type": "core::array::Array::<core::felt252>"
          }
        ],
        "outputs": [],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "add_module",
        "inputs": [
          {
            "name": "class_hash",
            "type": "core::starknet::class_hash::ClassHash"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "remove_module",
        "inputs": [
          {
            "name": "class_hash",
            "type": "core::starknet::class_hash::ClassHash"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "update_core_module",
        "inputs": [
          {
            "name": "class_hash",
            "type": "core::starknet::class_hash::ClassHash"
          },
          {
            "name": "core_exclusive",
            "type": "core::bool"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_core_module",
        "inputs": [],
        "outputs": [
          {
            "type": "core::starknet::class_hash::ClassHash"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "is_core_module_exclusive",
        "inputs": [],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "is_module",
        "inputs": [
          {
            "name": "class_hash",
            "type": "core::starknet::class_hash::ClassHash"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "call_on_module",
        "inputs": [
          {
            "name": "class_hash",
            "type": "core::starknet::class_hash::ClassHash"
          },
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
        "name": "execute_on_module",
        "inputs": [
          {
            "name": "class_hash",
            "type": "core::starknet::class_hash::ClassHash"
          },
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
    "name": "SRC5Impl",
    "interface_name": "openzeppelin::introspection::interface::ISRC5"
  },
  {
    "type": "interface",
    "name": "openzeppelin::introspection::interface::ISRC5",
    "items": [
      {
        "type": "function",
        "name": "supports_interface",
        "inputs": [
          {
            "name": "interface_id",
            "type": "core::felt252"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "type": "constructor",
    "name": "constructor",
    "inputs": [
      {
        "name": "core_validator",
        "type": "core::felt252"
      },
      {
        "name": "public_key",
        "type": "core::array::Array::<core::felt252>"
      }
    ]
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
    "name": "openzeppelin::introspection::src5::SRC5Component::Event",
    "kind": "enum",
    "variants": []
  },
  {
    "type": "event",
    "name": "openzeppelin::upgrades::upgradeable::UpgradeableComponent::Upgraded",
    "kind": "struct",
    "members": [
      {
        "name": "class_hash",
        "type": "core::starknet::class_hash::ClassHash",
        "kind": "data"
      }
    ]
  },
  {
    "type": "event",
    "name": "openzeppelin::upgrades::upgradeable::UpgradeableComponent::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "Upgraded",
        "type": "openzeppelin::upgrades::upgradeable::UpgradeableComponent::Upgraded",
        "kind": "nested"
      }
    ]
  },
  {
    "type": "event",
    "name": "smartr::account::smartraccount::SmartrAccount::Event",
    "kind": "enum",
    "variants": [
      {
        "name": "AccountEvent",
        "type": "smartr::component::account::AccountComponent::Event",
        "kind": "flat"
      },
      {
        "name": "SRC5Event",
        "type": "openzeppelin::introspection::src5::SRC5Component::Event",
        "kind": "flat"
      },
      {
        "name": "UpgradeableEvent",
        "type": "openzeppelin::upgrades::upgradeable::UpgradeableComponent::Event",
        "kind": "flat"
      }
    ]
  }
] as const;
