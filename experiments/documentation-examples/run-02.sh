#!/bin/bash

set -e

npx tsc --build
node dist/02-setup.js

