#!/bin/bash

set -e

npx tsc --build
node dist/01-declare-class.js
node dist/01-check-class.js
node dist/01-load-eth.js
node dist/01-deploy-account.js
node dist/01-using-account.js

