/// <reference path="../../../node_modules/mocha/mocha.js"/>
/// <reference path="../../../node_modules/chai/chai.js"/>
/// <reference path="../../../Scripts/ExtensionsJS/math.js"/>

var expect = chai.expect;
var assert = chai.assert;

describe("Perform Math ExtensionsJS unit testing",
    function() {

        it("limit static function is defined",
            function() {
                expect(Math.limit).not.to.equal(undefined);
            });

        var verifyLimit = function(x, min, max, expected) {
            var actual = Math.limit(x, min, max);
            expect(actual).to.equal(expected);
        };

        it("run through the use cases",
            function() {

                // unspecified is basically undefined
                var useCases = [
                    { x: 1, min: 3, max: 5, expected: 3 },
                    { x: 3, min: 3, max: 5, expected: 3 },
                    { x: 4, min: 3, max: 5, expected: 4 },
                    { x: 5, min: 3, max: 5, expected: 5 },
                    { x: 7, min: 3, max: 5, expected: 5 },
                    { x: 1, min: 2, max: 2, expected: 2 },
                    { x: 2, min: 2, max: 2, expected: 2 },
                    { x: 3, min: 2, max: 2, expected: 2 }
                ];

                for (var i = 0; i < useCases.length; i++) {
                    var useCase = useCases[i];
                    verifyLimit(useCase.x, useCase.min, useCase.max, useCase.expected);
                }
            });
    });
