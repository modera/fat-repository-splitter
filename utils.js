function async(generator) {
    return function() {
        const g = generator();

        function handle(message) {
            if (message.done) {
                return Promise.resolve(message.value);
            }

            Promise.resolve(message.value)
                .then(result => {
                    return handle(g.next(result));
                })
                .catch(e => {
                    return handle(g.throw(e));
                })
            ;
        }

        try {
            return handle(g.next());
        } catch (e) {
            g.throw(e);
        }
    }
}

function promify(nodeFn) {
    return function() {
        var args = Array.prototype.slice.call(arguments); // cloning arguments

        return new Promise((resolve, reject) => {
            args.push((error, result) => {
                if (error) {
                    return reject(error);
                } else {
                    return resolve(result);
                }
            });

            nodeFn.apply(this, args);
        });
    }
}

function augmentNativeFunctions() {
    Function.prototype.$call = function() {
        return promify(this).apply(this, arguments);
    };
}

module.exports = {
    async, promify, augmentNativeFunctions
};