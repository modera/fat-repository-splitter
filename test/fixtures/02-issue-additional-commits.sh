#!/usr/bin/env bash

cwd="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $cwd

repo_name=foo-direct-commit

cd files

if [ -e $repo_name ] ; then
    rm -rf $repo_name
fi

git clone foo.git $repo_name
cd $repo_name
touch .gitignore
git add .
git commit -m "a direct commit to foo repo"
git push