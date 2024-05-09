#!/bin/bash

set -e

npx tsc --build
node dist/05-setup.js

# Use P256 Validator as a Secondary validator
node dist/05-declare-eth-validator.js
node dist/05-check-eth-validator.js
node dist/05-add-module.js
node dist/05-register-publickey.js
node dist/05-get-publickey.js
node dist/05-execute-tx.js
node dist/05-remove-module.js

# Use P256 Validator as a Core validator
node dist/05-deploy-account.js
node dist/05-execute-tx-core.js
