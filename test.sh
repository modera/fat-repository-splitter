#!/usr/bin/env bash

# This script can be used to launch functional tests to verify
# that splitter works correctly

set -eu

cwd="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $cwd

fixtures_dir_full_local=test/fixtures
fixtures_dir_full=$cwd/$fixtures_dir_full_local

bash $fixtures_dir_full/create-fixtures.sh > /dev/null

echo ""
echo "====================================================="
echo " Finished setting up fixtures, splitting a test repo"
echo "====================================================="
echo ""

sudo rm -rf origin tmp

./run.sh $fixtures_dir_full/files/keys/id_rsa $fixtures_dir_full_local/files/fat.git config.json

echo ""
echo "===================="
echo " Now running tests"
echo "===================="
echo ""

docker run -t -v $cwd:/tmp/mnt -w /tmp/mnt digitallyseamless/nodejs-bower-grunt node test/test.js



