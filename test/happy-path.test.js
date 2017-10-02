const test = require('tape');
const git = require('./git.js');

test('check "foo" repository', (t) => {
    const path = git.cloneRepository('foo');

    t.equal(git.getTags(path), 'v0.1.0 v0.2.0');

    const commits = git.getCommits(path);
    t.equal(commits.length, 1);
    t.ok(commits[0].substr('2nd commit ; src/Foo/README.md added') !== -1);

    t.end();
});

test('check "bar" repository', (t) => {
    const path = git.cloneRepository('bar');
    t.equal(git.getTags(path), 'v0.2.0');

    const commits = git.getCommits(path);
    t.equal(commits.length, 2);
    t.ok(commits[0].substr('3rd commit ; src/Bar/README.md added') !== -1);
    t.ok(commits[1].substr('4th commit ; src/Bar/README.md changed') !== -1);

    t.end();
});