#!/bin/bash

set -e

npx tsc --build
node dist/04-setup.js
