const test = require('tape');
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

test('check "foo" repository', (t) => {
    const path = cloneRepository('foo');

    t.equal(getTags(path), 'v0.1.0 v0.2.0');

    const commits = getCommits(path);
    t.equal(commits.length, 1);
    t.ok(commits[0].substr('2nd commit ; src/Foo/README.md added') !== -1);

    t.end();
});

test('check "bar" repository', (t) => {
    const path = cloneRepository('bar');
    t.equal(getTags(path), 'v0.2.0');

    const commits = getCommits(path);
    t.equal(commits.length, 2);
    t.ok(commits[0].substr('3rd commit ; src/Bar/README.md added') !== -1);
    t.ok(commits[1].substr('4th commit ; src/Bar/README.md changed') !== -1);

    t.end();
});