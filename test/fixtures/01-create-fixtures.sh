#!/usr/bin/env bash

set -eu

cwd="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $cwd

fixtures_dir_local=files
fixtures_dir_full=$cwd/$fixtures_dir_local
keys_dir_full=$fixtures_dir_full/keys

function create_bare_repo() {
    name=$1

    cd $cwd
    pathname=$fixtures_dir_full/$name.git

    if [ -e $pathname ] ; then
        sudo rm -rf $pathname
    fi
    mkdir $pathname
    cd $pathname
    git init . --bare > /dev/null
    cd $cwd
}

function generate_dummy_key() {
    if [ -e $keys_dir_full ] ; then
        rm -rf $keys_dir_full
    fi
    mkdir -p $keys_dir_full

    ssh-keygen -t rsa -b 4096 -f $keys_dir_full/id_rsa -N '' > /dev/null
}

sudo rm -rf $fixtures_dir_full

generate_dummy_key
create_bare_repo foo
create_bare_repo bar

cd $fixtures_dir_full

rm -rf fat fat.git
mkdir fat fat.git
cd fat.git && git init . --bare && cd ../
cd fat
git init .

fat_dir_full=`pwd`

cp $cwd/config.json .
git add .
git commit -m "initial commit  - config.json added"

mkdir -p src/Foo
cd src/Foo/
echo "# Foo" > README.md
cd $fat_dir_full
git add .
git commit -m "2nd commit ; src/Foo/README.md added"
git tag -a v0.1.0 -m "1st tag"
mkdir src/Bar
cd src/Bar/
echo "# Bar" > README.md
cd $fat_dir_full
git add .
git commit -m "3rd commit ; src/Bar/README.md added"
git tag -a v0.2.0 -m "2nd tag"

cd src/Bar/
echo "# Bar header" > README.md
cd $fat_dir_full
git add .
git commit -m "4th commit ; src/Bar/README.md changed"

cd $fat_dir_full
git remote add origin ../fat.git
git push -u origin --all --follow-tags