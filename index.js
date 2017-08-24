const utils = require('./utils.js');
const fs = require('fs');
const childProc = require('child_process');
const sprintf = require("sprintf-js").sprintf;
const ncp = require('ncp');
const rmdir = require('rmdir');
const colors = require('colors');

// ---

// Location of split.json
const configPathname = process.argv[2] ? process.argv[2] : 'config.json';

// ----

utils.augmentNativeFunctions();

/**
 * @param {String} pathname
 *
 * @return {Promise}
 */
function fileExists(pathname) {
    return new Promise(resolve => {
        fs.stat(pathname, (err) => {
            let fileExists = !err;

            resolve(fileExists);
        })
    });
}

/**
 * @param {String} output
 *
 * @return {String[]}
 */
function extractNotChangedTags(output) {
    let unchangedTags = [];

    // MPFE-925
    // When Git cannot rewrite certain tags it prints a warning message like this:
    // "WARNING: Ref 'refs/tags/3.3.10' is unchanged"
    // Here we are collecting tag names which could not have been rewritten
    // to delete them later
    let pattern = /WARNING: Ref 'refs\/tags\/(.+)' is unchanged/i;
    if (pattern.test(output)) {
        output.split("\n").forEach(function(line) {
            if (pattern.test(line)) {
                var matches = pattern.exec(line);

                unchangedTags.push(matches[1]);
            }
        });
    }

    return unchangedTags;
}

/**
 * @param {String} command
 * @param {Object} options
 * @param {Function} callback
 */
function exec(command, options, callback) {
    console.log(' $ %s'.yellow, command);

    childProc.exec(command, options, callback);
}

/**
 * @param {String} path
 */
function printNewRepositoryBeingHandled(path) {
    let label = 'Dealing with ' + path;
    let labelOffset = 5;
    let horizonalSplitter = new Array(label.length + labelOffset).join('#');

    console.log(horizonalSplitter);
    console.log('# ' + label);
    console.log(horizonalSplitter);
}

/**
 * @param {String} raw
 * @return {String}
 */
function formatCommandOutput(raw) {
    return raw.replace(/^/gm, "     ");
}

utils.async(function* () {
    try {
        if (!(yield fileExists(configPathname))) {
            throw sprintf('Configuration file "%s" is not found.', configPathname);
        }
        const jsonConfig = yield fs.readFile.$call(configPathname);
        const config = JSON.parse(jsonConfig);

        if (yield fileExists('tmp')) {
            yield rmdir.$call('tmp');
        }
        yield fs.mkdir.$call('tmp');

        if (yield fileExists('origin')) {
            yield exec.$call('cd origin && git fetch --all');
        } else {
            yield exec.$call(sprintf('git clone --mirror %s origin', config.origin));
        }

        let failedPushRepositories = [];

        for (let path in config.splits) {
            if (!config.splits.hasOwnProperty(path)) {
                continue;
            }
            let url = config.splits[path];

            printNewRepositoryBeingHandled(path);

            let tempWorkingCopyPathname = 'tmp/'+(path.replace(/\//g, ''));

            yield ncp.$call('origin', tempWorkingCopyPathname);
            yield exec.$call(sprintf('git remote rm origin'), { cwd: tempWorkingCopyPathname });

            let filterBranchCommand = sprintf(
                'cd %s && git filter-branch -f --prune-empty --tag-name-filter cat --subdirectory-filter %s -- --all',
                tempWorkingCopyPathname,
                path
            );
            let filterBranchResult = yield new Promise((resolve, reject) => {
                exec(filterBranchCommand, (err, stdout, stderr) => {
                    if (err) {
                        return reject(err);
                    } else {
                        return resolve({ stdout, stderr });
                    }
                });
            });
            console.log(formatCommandOutput(filterBranchResult.stdout));

            // MPFE-925
            // If a tag could not have been rewritten then we will delete it otherwise this happens:
            // Imagine you create a project, add a file src/Foo/FOO-README.md and commit it, after
            // that you create another file in src/Bar/BAR-README.md directory, commit it and then create
            // an another tag v0.2.0, then you configure splitter to split project using src/Foo and
            // src/Bar paths and without manually deleting tags what would happen is that
            // a repository represented by src/Bar would have two version - v0.1.0 and v0.2.0 but
            // at the time when v0.1.0 tag was created there essentially was not src/Bar directory yet
            // and in such cases Git will simply keep the tag to reference to the non-splitted repository -
            // repository that contains both src/Foo, src/Bar and any other possible files
            let unchangedTags = extractNotChangedTags(filterBranchResult.stderr);
            if (unchangedTags.length > 0) {
                yield exec.$call('git tag -d ' + unchangedTags.join(' '), { cwd: tempWorkingCopyPathname });
            }

            yield exec.$call(sprintf('cd %s && git remote add origin %s', tempWorkingCopyPathname, url));

            try {
                // http://stackoverflow.com/questions/5195859/push-a-tag-to-a-remote-repository-using-git
                // --follow-tags won't push "lightweight" tags (not annotated) though
                yield exec.$call(sprintf('git push origin --all --follow-tags'), { cwd: tempWorkingCopyPathname });
                // this will push non-annotated tags as well:
                yield exec.$call(sprintf('git push origin --tags'), { cwd: tempWorkingCopyPathname });
            } catch (e) {
                console.error(formatCommandOutput(e.message).red);

                failedPushRepositories.push(url);
            }

            console.log();
        }

        if (failedPushRepositories.length > 0) {
            console.log('Failed to push changes to some repositories: ');
            for (let url of failedPushRepositories) {
                console.log(' * ' + url);
            }

            // INF-37
            process.exit(2);
        }
    } catch (e) {
        console.error(e);

        process.exit(1);
    }
})();