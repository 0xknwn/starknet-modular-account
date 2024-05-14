#!/bin/bash

set -e

npx tsc --build
node dist/03-setup.js
node dist/03-check-class.js
node dist/03-module-installed.js
node dist/03-registered-publickeys.js
node dist/03-add-publickeys.js
node dist/03-registered-publickeys.js
node dist/03-execute-tx-pk2.js
node dist/03-increase-threshold.js
node dist/03-get-threshold.js

set +e
node dist/03-execute-tx.js

set -e
node dist/03-execute-tx-multiple-signers.js
node dist/03-decrease-threshold.js
node dist/03-get-threshold.js
node dist/03-remove-publickeys.js
node dist/03-registered-publickeys.js
