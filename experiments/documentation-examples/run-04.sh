#!/bin/bash

set -e

npx tsc --build
node dist/04-setup.js
node dist/04-declare-class.js
node dist/04-add-module.js
node dist/04-sessionkey-transaction.js
node dist/04-block-sessionkey.js
node dist/04-remove-module.js
