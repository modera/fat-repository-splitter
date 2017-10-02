const test = require('tape');
const git = require('./git.js');

test('make sure "foo" contains only "master" branch', (t) => {
    const path = git.cloneRepository('foo');

    const commits = git.getCommits(path);
    t.equal(commits.length, 1);
    t.ok(commits[0].substr('2nd commit ; src/Foo/README.md added') !== -1);

    t.end();
});