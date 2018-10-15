var KEYNOTSET = "key not set";
var NOTACMD = "not a command? (is it upper case?)";
var WRONGNUMARGS = "wrong number of arguments";
var NOTRANSACTION = "no transaction";

var world = {};
var currentTransactions = [];

var actions = {
    "GET": function(key) {
        var worldNow = Object.assign({}, world);
        if (currentTransactions.length) {
            worldNow = currentTransactions.reduce(function(worldSoFar, trx) {
                return Object.assign(worldSoFar, trx);
            }, worldNow);
        }
        if (Object.keys(worldNow).includes(key.toString())) {
            return worldNow[key.toString()];
        }
        return KEYNOTSET;
    },

    "SET": function(key, value) {
        if (currentTransactions.length) {
            currentTransactions[currentTransactions.length - 1][key.toString()] = value.toString();
        } else {
            world[key.toString()] = value.toString();
        }
    },

    "DELETE": function(key) {
        if (currentTransactions.length) {
            delete currentTransactions[currentTransactions.length - 1][key.toString()];
        } else {
            delete world[key.toString()];
        }
    },

    "COUNT": function(value) {
        // if i were to have to duplicate this code once more, i would abstract it out
        var worldNow = Object.assign({}, world);
        if (currentTransactions.length) {
            worldNow = currentTransactions.reduce(function(worldSoFar, trx) {
                return Object.assign(worldSoFar, trx);
            }, worldNow);
        }
        return Object.keys(worldNow).reduce((count, key) => {
            if (worldNow[key] === value) {
                return ++count;
            }
            return count;
        }, 0).toString();
    },

    "BEGIN": function() {
        currentTransactions.push({});
    },

    "COMMIT": function() {
        if (!currentTransactions.length) {
            return NOTRANSACTION;
        }
        if (currentTransactions.length > 1) {
            Object.assign(
                currentTransactions[currentTransactions.length - 2],
                currentTransactions[currentTransactions.length - 1]
            );
        } else {
            Object.assign(world, currentTransactions[0]);
        }
        currentTransactions.pop();
    },

    "ROLLBACK": function() {
        if (!currentTransactions.length) {
            return NOTRANSACTION;
        }
        currentTransactions.pop();
    }
};

function doCmd(lineInput) {
    var fakeParse = lineInput.split(' ').filter((item) => item.length);
    // allow spaces in values, because what the heck, why not
    if (fakeParse.length > 3 || (fakeParse[0] === 'COUNT' && fakeParse.length > 2)) {
        // there might be a cleaner way to do this, but i have like 2 min left
        if (fakeParse[0] === 'COUNT') {
            fakeParse = ['COUNT', fakeParse.slice(1).join(' ')];
        } else {
            fakeParse = [fakeParse[0], fakeParse[1], fakeParse.slice(2).join(' ')];
        }
        // *sigh* now I'm sorry I enabled spaces in values. oh well
    }

    var result;
    if (typeof actions[fakeParse[0]] !== 'undefined') {
        var actualCmd = actions[fakeParse[0]];
        var args = fakeParse.slice(1);
        if (actualCmd.length !== args.length) {
            result = WRONGNUMARGS;
        } else {
            result = actions[fakeParse[0]].apply(null, fakeParse.slice(1));
        }
    } else {
        result = NOTACMD;
    }
    return result;
}

module.exports = {
    doCmd: doCmd
};

if (require.main === module) {
    var readline = require("readline");
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on('line', (line) => {
        var resp = doCmd(line);
        if (resp && resp.length) {
            console.log('=> ' + resp + '\n');
        }
    });
}
