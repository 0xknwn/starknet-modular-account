#!/bin/bash

set -e

npx tsc --build
node dist/02-setup.js
node dist/02-execute-tx.js
node dist/02-check-class.js
node dist/02-module-installed.js
node dist/02-registered-publickey.js
node dist/02-update-publickey.js
node dist/02-registered-publickey.js
node dist/02-execute-tx-pk2.js
node dist/02-execute-tx-pk2-with-module.js
