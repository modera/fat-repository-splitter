#!/usr/bin/env bash

# This script can be used to launch functional tests to verify
# that splitter works correctly

set -eu

cwd="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $cwd

fixtures_dir_full_local=test/fixtures
fixtures_dir_full=$cwd/$fixtures_dir_full_local

function run_script() {
    script_name=$1

    bash $fixtures_dir_full/$script_name.sh > /dev/null
}
function create_fixtures() {
    run_script 01-create-fixtures
}

create_fixtures

echo ""
echo "====================================================="
echo " Finished setting up fixtures, splitting a test repo"
echo "====================================================="
echo ""

sudo rm -rf origin tmp

echo ""
echo "================================"
echo " Checking a happy path scenario"
echo "================================"
echo ""

./run.sh $fixtures_dir_full/files/keys/id_rsa $fixtures_dir_full_local/files/fat.git config.json
docker run -t -v $cwd:/tmp/mnt -w /tmp/mnt digitallyseamless/nodejs-bower-grunt node test/happy-path.test.js

echo ""
echo "================================"
echo " Checking how overwrite working"
echo "================================"
echo ""

run_script 02-issue-additional-commits
./run.sh $fixtures_dir_full/files/keys/id_rsa $fixtures_dir_full_local/files/fat.git config.json
docker run -t -v $cwd:/tmp/mnt -w /tmp/mnt digitallyseamless/nodejs-bower-grunt node test/git-push-force.test.js

echo ""
echo "=================================================================================="
echo " Deleting a branch from fat repository should delete it from the children as well"
echo "=================================================================================="
echo ""

run_script 03-delete-yolo-branch
./run.sh $fixtures_dir_full/files/keys/id_rsa $fixtures_dir_full_local/files/fat.git config.json
#docker run -t -v $cwd:/tmp/mnt -w /tmp/mnt digitallyseamless/nodejs-bower-grunt node test/child-repo-branch-delete.test.js


