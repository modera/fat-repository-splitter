const { execSync } = require('child_process');

const dir = __dirname + '/fixtures/files';

const cloneRepository = (source, target) => {
    target = target || source;

    execSync(`rm -rf ${source} && git clone ${source}.git ${target}`, { cwd: dir });

    return dir+'/'+source;
};

const getTags = (repositoryPath) => {
    let tags = execSync('git tag', { cwd: repositoryPath }).toString();

    tags = tags.split("\n");
    tags.pop();

    return tags.join(' ');
};

const getCommits = (repositoryPath) => {
    let commits = execSync('git log --pretty=oneline', { cwd: repositoryPath }).toString();

    commits = commits.split("\n");
    commits.pop();

    return commits;
};

const getBranches = (repositoryPath) => {
    let plainOutput = execSync('git branch', { cwd: repositoryPath }).toString();
    plainOutput = plainOutput.split("\n");
    plainOutput.pop();

    return plainOutput.map((name) => name.replace('* ', ''));
};

module.exports = {
    cloneRepository, getTags, getCommits, getBranches
};