/*

SET <key> <value>
GET <key>
DELETE <key>
COUNT <value>
BEGIN
COMMIT
ROLLBACK



*/

var assert = require("assert");


var doCmd = require("./cruddy").doCmd;

var KEYNOTSET = "key not set";
var NOTACMD = "not a command? (is it upper case?)";
var WRONGNUMARGS = "wrong number of arguments";
var NOTRANSACTION = "no transaction";

// it is case sensitive
assert.strictEqual(doCmd("GET 123"), KEYNOTSET);
assert.strictEqual(doCmd("get 123"), NOTACMD);

// it correctly parses commands sent with multiple spaces
assert.strictEqual(doCmd("GET   123"), KEYNOTSET);

// it doesn't do the thing where you can index numerically into the actions
assert.strictEqual(doCmd("0 123"), NOTACMD);

// it sets
doCmd("SET 123 4");
assert.strictEqual(doCmd("GET 123"), "4");

// it doesn't set nothing
assert.strictEqual(doCmd("SET 123"), WRONGNUMARGS);

// it sets values with spaces in them!
doCmd("SET areSpacesCool yes, they are");
assert.strictEqual(doCmd("GET areSpacesCool"), "yes, they are");
assert.strictEqual(doCmd("COUNT yes, they are"), "1");

// it deletes
doCmd("DELETE 123");
assert.strictEqual(doCmd("GET 123"), KEYNOTSET);

// it counts
doCmd("SET foo 3");
doCmd("SET bar 3");
doCmd("SET baz 4");
assert.strictEqual(doCmd("COUNT 3"), "2");
assert.strictEqual(doCmd("COUNT 4"), "1");
assert.strictEqual(doCmd("COUNT 65"), "0");

// it begins transactions
doCmd("BEGIN");
doCmd("SET foo hey_now");
assert.strictEqual(doCmd("GET foo"), "hey_now");
doCmd("ROLLBACK");
assert.strictEqual(doCmd("GET foo"), "3");

// and commits them, hey!
doCmd("BEGIN");
doCmd("SET foo hey_now");
doCmd("COMMIT");
assert.strictEqual(doCmd("GET foo"), "hey_now");
