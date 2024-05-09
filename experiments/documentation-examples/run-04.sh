#!/bin/bash

set -e

npx tsc --build
node dist/04-setup.js

# Use Eth Validator as a Secondary validator
node dist/04-declare-eth-validator.js
node dist/04-check-eth-validator.js
node dist/04-add-module.js
node dist/04-register-publickey.js
node dist/04-get-publickey.js
node dist/04-execute-tx.js
node dist/04-remove-module.js

# Use Eth Validator as a Core validator
node dist//04-deploy-account.js
node dist/04-execute-tx-core.js
