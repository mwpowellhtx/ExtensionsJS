/// <reference path="../../../node_modules/mocha/mocha.js"/>
/// <reference path="../../../node_modules/chai/chai.js"/>
/// <reference path="../../../Scripts/ExtensionsJS/number.js"/>

var expect = chai.expect;
var assert = chai.assert;

describe("Perform Number ExtensionsJS unit testing",
    function() {

        describe("Perform isNumeric unit testing",
            function() {

                it("isNumeric static function is defined",
                    function() {
                        // ReSharper disable once PossiblyUnassignedProperty
                        expect(Number.isNumeric).not.to.equal(undefined);
                    });

                var verifyIsNumeric = function(x, expected) {
                    var actual = Number.isNumeric(x);
                    // ReSharper disable once PossiblyUnassignedProperty
                    expect(actual).to.equal(expected);
                };

                it("run through the use cases",
                    function() {

                        // unspecified is basically undefined
                        var useCases = [
                            { x: 0, expected: true },
                            { x: 123, expected: true },
                            { x: -123, expected: true },
                            { x: 1.234, expected: true },
                            { x: -1.234, expected: true },
                            { x: NaN, expected: false },
                            { x: Infinity, expected: false },
                            { x: -Infinity, expected: false },
                            { x: "blahblahblah", expected: false },
                            { x: {}, expected: false },
                            { x: [], expected: false },
                            { x: function() {}, expected: false }
                        ];

                        for (var i = 0; i < useCases.length; i++) {
                            var useCase = useCases[i];
                            verifyIsNumeric(useCase.x, useCase.expected);
                        }
                    });
            });

        describe("Perform toBoolean unit testing",
            function() {

                it("toBoolean static function is defined",
                    function() {
                        // ReSharper disable once PossiblyUnassignedProperty
                        expect(Number.toBoolean).not.to.equal(undefined);
                    });

                var verifyToBoolean = function(x, expected) {
                    var actual = Number.toBoolean(x);
                    // ReSharper disable once PossiblyUnassignedProperty
                    expect(actual).to.equal(expected);
                };

                it("run through the use cases",
                    function() {

                        // unspecified is basically undefined
                        var useCases = [
                            { x: 0, expected: false },
                            { x: 123, expected: true },
                            { x: -123, expected: true },
                            { x: 1.234, expected: true },
                            { x: -1.234, expected: true },
                            { x: NaN, expected: undefined },
                            { x: Infinity, expected: undefined },
                            { x: -Infinity, expected: undefined },
                            { x: "blahblahblah", expected: undefined },
                            { x: {}, expected: undefined },
                            { x: [], expected: undefined },
                            { x: function() {}, expected: undefined }
                        ];

                        for (var i = 0; i < useCases.length; i++) {
                            var useCase = useCases[i];
                            verifyToBoolean(useCase.x, useCase.expected);
                        }
                    });
            });
    });
