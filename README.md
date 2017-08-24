# fat-repository-splitter

A nodejs script that allows to split a repository into sub-repositories using configuration defined in `config.json`.

A sample `config.json`:

    {
        "origin": "git@bitbucket.org:sergeil/dummy-origin.git",
        "splits": {
            "A-dir": "git@bitbucket.org:sergeil/dummy-origin-a.git",
            "B-dir": "git@bitbucket.org:sergeil/dummy-origin-b.git"
        }
    }

When `index.js` script is executed then it will clone/fetch a repository `dummy-origin` and split it into two
repositories. In this given example, first repository will contain everything from origin's "A-dir" and its content is
going to be pushed to `git@bitbucket.org:sergeil/dummy-origin-a.git`.

If you have Docker installed then you can run this script as easy as this:

    ./run.sh ~/.ssh/id_rsa git@bitbucket.org:foobarbaz/acme.git split.json
    
For more information regarding meaning of the arguments please see the contents of `run.sh` script.