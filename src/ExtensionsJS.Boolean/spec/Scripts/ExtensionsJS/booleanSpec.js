/// <reference path="../../../node_modules/mocha/mocha.js"/>
/// <reference path="../../../node_modules/chai/chai.js"/>
/// <reference path="../../../Scripts/ExtensionsJS/boolean.js"/>

var expect = chai.expect;
var assert = chai.assert;

describe("Perform Boolean ExtensionsJS unit testing",
    function() {

        it("parse static function is defined",
            function() {
                expect(Boolean.parse).not.to.equal(undefined);
            });

        var verifyParse = function(s, expected) {
            var actual = Boolean.parse(s);
            expect(actual).to.equal(expected);
        };

        it("run through the use cases",
            function() {

                // unspecified is basically undefined
                var useCases = [
                    { x: "true", expected: true },
                    { x: "yes", expected: true },
                    { x: "1", expected: true },
                    { x: "false", expected: false },
                    { x: "no", expected: false },
                    { x: "0", expected: false },
                    { x: "blahblahblah" },
                    { x: 0, expected: false },
                    { x: 123, expected: true },
                    { x: -123, expected: true },
                    { x: 0.0, expected: false },
                    { x: 1.234, expected: true },
                    { x: Infinity },
                    { x: -Infinity },
                    { x: [] },
                    { x: {} },
                    { x: function() {} }
                ];

                for (var i = 0; i < useCases.length; i++) {
                    var useCase = useCases[i];
                    verifyParse(useCase.x, useCase.expected);
                }
            });
    });
