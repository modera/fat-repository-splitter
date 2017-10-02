#!/usr/bin/env bash

cwd="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $cwd

cd files/fat

git checkout master
git branch -D yolo
git push origin :yolo