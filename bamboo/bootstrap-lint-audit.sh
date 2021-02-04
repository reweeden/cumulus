#!/bin/bash
set -e
# This script runs before lint.sh, audit.sh in the agent container
. ./bamboo/set-bamboo-env-variables.sh
. ./bamboo/abort-if-not-pr.sh

echo "RUNNING CHECKS"

ls -ltra /
echo "RUNNING FIND CUMULUS"
find /source/cumulus/
echo "RUNNING FIND CUMULUS"
find /cumulus/

if [[ $USE_CACHED_BOOTSTRAP == true ]]; then ## Change into cached cumulus, pull down /cumulus ref and run there
  echo "*** Using cached bootstrap"
  cp .bamboo_env_vars /cumulus/
  cd /cumulus/
  git fetch --all
  git checkout "$GIT_SHA"
  rm -f package-lock.json
fi

# Extract cache of compiled TS files
# ./bamboo/extract-ts-build-cache.sh
npm install --ignore-scripts --no-package-lock
ln -s /dev/stdout ./lerna-debug.log
