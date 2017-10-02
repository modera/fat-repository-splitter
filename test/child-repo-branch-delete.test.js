const test = require('tape');
const git = require('./git.js');

// MPFE-1044
test('make sure "foo.git" repository contains only 1 branch', (t) => {
    const branches = git.getBranches(__dirname + '/fixtures/files/foo.git');

    console.log(branches);

    t.equal(branches.length, 1);
    t.equal(branches[0], 'master');

    t.end();
});