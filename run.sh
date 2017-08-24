#!/usr/bin/env bash

# This is an example how you can run the splitter:
# ./run.sh ~/.ssh/id_rsa git@bitbucket.org:foobarbaz/acme.git split.json
# 1st argument - a location on a host machine of your private key that will be used to clone a repository specified
# as a second argument ; 2nd argument - repository to clone and eventually split ; 3rd argument - filename of split.json
# inside a repository cloned specified in in second argument

set -eu

ssh_private_key_path=$1
git_repository_url=$2
config_pathname=$3

if ! type docker > /dev/null; then
    echo "Docker is required to run this script."
    exit 1
fi

# This directory is going to be mounted into the container and removed when the script has finished execution
container_data_pathname=/tmp/splitter-files-$RANDOM-`date +%s`
mkdir -p $container_data_pathname

function cleanup() {
    rm -rf $container_data_pathname
    echo "Cleaned up the host machine, done"
}
trap cleanup EXIT

splitter_pathname=$container_data_pathname/split.sh
ssh_config_pathname=$container_data_pathname/ssh_config

cwd="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $cwd

# This is is going to be executed from inside the container
splitter_body="
#!/usr/bin/env bash

if [ ! -e node_modules ] ; then
    npm i
fi

git clone $git_repository_url /tmp/target-repository > /dev/null

node index.js /tmp/target-repository/$config_pathname
"
echo "$splitter_body" > $splitter_pathname
chmod +x $splitter_pathname

ssh_config_body="
    IdentityFile /root/.ssh/id_rsa
    StrictHostKeyChecking no
    UserKnownHostsFile=/dev/null
"
echo "$ssh_config_body" > $ssh_config_pathname

docker run -t --rm \
           -v $ssh_private_key_path:/root/.ssh/id_rsa \
           -v $ssh_config_pathname:/etc/ssh/ssh_config \
           -v $container_data_pathname:$container_data_pathname \
           -v `pwd`:/data \
           -w /data \
           digitallyseamless/nodejs-bower-grunt bash -c "$splitter_pathname"

