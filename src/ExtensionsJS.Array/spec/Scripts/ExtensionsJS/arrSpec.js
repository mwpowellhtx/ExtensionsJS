/* We will utilize Chutzpah for JavaScript Test Runner, however,
I think that any decent, reputable Test Runner would do.
https://github.com/mmanela/chutzpah */

/* Well, the test runner appears to be working now, including with default Runner
Executable Path. The issue(s) appeared to be centered around either including
<reference path='...'/> tags in the header of this file, or including the paths
in the chutzpah.json References={Path='...',...}.

The downside here is that IntelliSense appears to not be terribly happy with
the integration aspects, even with specific references. */

/// <reference path="../../../node_modules/mocha/mocha.js"/>
/// <reference path="../../../node_modules/chai/chai.js"/>
/// <reference path="../../../Scripts/ExtensionsJS/arr.js"/>

var expect = chai.expect;
var assert = chai.assert;

describe("Verify Array ExtensionsJS features",
    function() {

        var values = [1, 2, 3];

        var expectExists = function() {
            for (var i = 0; i < arguments.length; i++) {
                expect(arguments[i]).not.to.equal(undefined);
            }
        }

        // will utilize square function throughout
        var square = function(x) {
            return Math.pow(x, 2);
        };

        describe("Verify Array.range features",
            function() {

                it("range is defined",
                    function() {
                        expectExists(Array.range);
                    });

                it("range 1 to 3",
                    function() {
                        var actual = Array.range(1, 3);
                        var expected = [1, 2, 3];
                        expect(actual).has.length(expected.length).to.deep.equal(expected);
                    });

                it("range 1 to 3 step 2",
                    function() {
                        var actual = Array.range(1, 3, 2);
                        var expected = [1, 3];
                        expect(actual).has.length(expected.length).to.deep.equal(expected);
                    });

                it("range 1 to 4 step -1",
                    function() {
                        var actual = Array.range(1, 4, -1);
                        var expected = [4, 3, 2, 1];
                        expect(actual).has.length(expected.length).to.deep.equal(expected);
                    });

                it("range 4 to 1 step -2",
                    function() {
                        var actual = Array.range(4, 1, -2);
                        var expected = [4, 2];
                        expect(actual).has.length(expected.length).to.deep.equal(expected);
                    });
            });

        describe("Verify Array.prototype.joinDelimited features",
            function() {

                it("joinDelimited prototype function exists",
                    function() {
                        expectExists(values.joinDelimited);
                    });

                var verify = function(opts) {
                    opts.target = opts.target || values;
                    var actual = opts.delim === undefined
                        ? opts.target.joinDelimited()
                        : opts.target.joinDelimited(opts.delim);
                    expect(actual).to.equal(opts.expected);
                };

                it("default delimiter works",
                    function() {
                        verify({ expected: "1-2-3" });
                    });

                it("another delimiter works",
                    function() {
                        verify({ expected: "1::2::3", delim: "::" });
                    });
            });

        describe("Verify Array.prototype.any features",
            function() {

                it("any prototype function exists",
                    function() {
                        expectExists(values.any);
                    });

                it("any value will do",
                    function() {
                        // vet any with default predicate
                        var actual = values.any();
                        expect(actual).to.equal(true);
                    });

                it("there is any 2 value",
                    function() {
                        // vet any with user provided predicate
                        var actual = values.any(function(x) { return x === 2; });
                        expect(actual).to.equal(true);
                    });

                it("there are no 4 values",
                    function() {
                        // vet any with user provided predicate
                        var actual = values.any(function(x) { return x === 4; });
                        expect(actual).to.equal(false);
                    });
            });

        describe("Verify Array.prototype.all features",
            function() {

                it("all prototype function exists",
                    function() {
                        expectExists(values.all);
                    });

                it("all values must do using default predicate",
                    function() {
                        var actual = values.all();
                        expect(actual).to.equal(true);
                    });

                it("all non existing values must also do using default predicate",
                    function() {
                        var actual = [undefined, null, 0].all();
                        expect(actual).to.equal(false);
                    });

                // test cases and their predicates depend entirely upon the values under test
                it("all values must be greater than zero",
                    function() {
                        var actual = values.all(function(x) { return x > 0; });
                        expect(actual).to.equal(true);
                    });

                it("no values were less than or equal zero",
                    function() {
                        var actual = values.all(function(x) { return x <= 0; });
                        expect(actual).to.equal(false);
                    });
            });

        describe("Verify Array.prototype.combineWith features",
            function() {

                // TODO: TBD: need to revisit this one and figure out what was really meant by combineWith...
                var a = [1, 2, 3];
                var b = [4, 5, 6];
                var c = [7, 8, 9];

                it("combineWith prototype function exists",
                    function() {
                        expectExists(a.combineWith, b.combineWith, c.combineWith);
                    });

                it("TODO: TBD: implement me",
                    function() {
                        //expect(true).to.equal(false);
                    });
            });

        describe("Verify Array.prototype.each features",
            function() {

                it("each prototype function exists",
                    function() {
                        expectExists(values.each);
                    });

                it("verify simple visitation",
                    function() {
                        var r = [];
                        expect(values).to.deep.equal([1, 2, 3]);
                        expect(r).has.length(0);
                        // square each of the values
                        values.each(function(x) {
                            r.push(square(x));
                        });
                        expect(r).to.deep.equal([1, 4, 9]);
                    });
            });

        describe("Verify Array.prototype.equals features",
            function() {

                it("equals prototype function exists",
                    function() {
                        expectExists(values.equals);
                    });

                it("values equals [1, 2, 3] using default predicate",
                    function() {
                        var actual = values.equals([1, 2, 3]);
                        expect(actual).to.equal(true);
                    });

                it("values equals [1, 2, 3] using valid user predicate",
                    function() {
                        var pred = function(x, y) { return x === y; };
                        var actual = values.equals([1, 2, 3], pred);
                        expect(actual).to.equal(true);
                    });

                it("values does not equal [1, 2] using default predicate",
                    function() {
                        var actual = values.equals([1, 2]);
                        expect(actual).to.equal(false);
                    });

                it("values does not equal [1, 2, 3] using invalid user predicate",
                    function() {
                        var pred = function(x, y) { return x === y - 1; };
                        var actual = values.equals([1, 2, 3], pred);
                        expect(actual).to.equal(false);
                    });

                it("values does not equal '123' using default predicate",
                    function() {
                        var actual = values.equals("123");
                        expect(actual).to.equal(false);
                    });
            });

        describe("Verify Array.prototype.front features",
            function() {

                it("front prototype function exists",
                    function() {
                        expectExists(values.front);
                    });

                it("values [1, 2, 3] front equals 1",
                    function() {
                        var actual = values.front();
                        expect(actual).to.equal(1);
                    });
            });

        describe("Verify Array.prototype.back features",
            function() {

                it("back prototype function exists",
                    function() {
                        expectExists(values.back);
                    });

                it("values [1, 2, 3] back equals 3",
                    function() {
                        var actual = values.back();
                        expect(actual).to.equal(3);
                    });
            });

        describe("Verify Array.prototype.project features",
            function() {

                it("project prototype function exists",
                    function() {
                        expectExists(values.project);
                    });

                it("projection, of squares, in this case, works",
                    function() {
                        var actual = values.project(square);
                        expect(actual).to.deep.equal([1, 4, 9]);
                    });
            });

        describe("Verify Array.prototype.projectMany features",
            function() {

                it("projectMany prototype function exists",
                    function() {
                        expectExists(values.projectMany);
                    });

                it("projection, of many squares, in this case, works",
                    function() {
                        var actual = [
                            [].concat(values),
                            [].concat(values)
                        ].projectMany(square);
                        expect(actual).to.deep.equal([1, 4, 9, 1, 4, 9]);
                    });
            });

        describe("Verify Array.prototype.sum features",
            function() {

                it("sum prototype function exists",
                    function() {
                        expectExists(values.sum);
                    });

                it("values [1, 2, 3] sum equals 6",
                    function() {
                        var actual = values.sum();
                        expect(actual).to.equal(6);
                    });
            });

        describe("Verify Array.prototype.where features",
            function() {

                it("where prototype function exists",
                    function() {
                        expectExists(values.where);
                    });

                it("values [1, 2, 3] where value greater than 1",
                    function() {
                        var pred = function(x) { return x > 1; };
                        var actual = values.where(pred);
                        expect(actual).to.deep.equal([2, 3]);
                    });
            });

        describe("Verify Array.prototype.max features",
            function() {

                it("max prototype function exists",
                    function() {
                        expectExists(values.max);
                    });

                it("values [1, 2, 3] max equals 3",
                    function() {
                        var actual = values.max();
                        expect(actual).to.equal(3);
                    });
            });

        describe("Verify Array.prototype.min features",
            function() {

                it("min prototype function exists",
                    function() {
                        expectExists(values.min);
                    });

                it("values [1, 2, 3] min equals 1",
                    function() {
                        var actual = values.min();
                        expect(actual).to.equal(1);
                    });
            });
    });

//// http://stackoverflow.com/questions/15298912/javascript-generating-combinations-from-n-arrays-with-m-elements
//if (Array.prototype.combineWith === undefined) {
//    Array.prototype.combineWith = function() {
//        var r = [];
//        // ReSharper disable once PossiblyUnassignedProperty
//        var arrs = [this].concat(Array.from(arguments));
//        arrs.reduceRight(function(g, x, i) {
//            return function(arr) {
//                for (var j = 0, l = x.length; j < l; j++) {
//                    var a = arr.slice(); // clone arr
//                    a[i] = x[j];
//                    g(a);
//                }
//            };
//        }, Array.prototype.push.bind(r))(new Array(arrs.length));
//        return r;
//    }
//}

//// TODO: could potentially turn these into Deque operations as well (one of my favorite data structures ever)
