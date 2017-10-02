const { execSync } = require('child_process');

const dir = __dirname + '/fixtures/files';

const cloneRepository = (name) => {
    execSync(`rm -rf ${name} && git clone ${name}.git`, { cwd: dir });

    return dir+'/'+name;
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

module.exports = {
    cloneRepository, getTags, getCommits
};