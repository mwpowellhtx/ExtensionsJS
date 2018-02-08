/// <reference path="../../../node_modules/mocha/mocha.js"/>
/// <reference path="../../../node_modules/chai/chai.js"/>
/// <reference path="../../../Scripts/ExtensionsJS/str.js"/>

var expect = chai.expect;
var assert = chai.assert;

describe("Perform String ExtensionsJS unit testing",
    function() {

        describe("Perform Contains unit testing",
            function() {

                it("Contains static function is defined",
                    function() {
                        // ReSharper disable once PossiblyUnassignedProperty
                        expect(String.prototype.contains).not.to.equal(undefined);
                    });

                var verifyStringContains = function(s, x, expected) {
                    var actual = s.contains(x);
                    // ReSharper disable once PossiblyUnassignedProperty
                    expect(actual).to.equal(expected);
                };

                it("run through the use cases",
                    function() {

                        // unspecified is basically undefined
                        var useCases = [
                            { s: "cats and dogs", x: "dogs", expected: true },
                            { s: "rain or shine", x: "cats", expected: false }
                        ];

                        for (var i = 0; i < useCases.length; i++) {
                            var useCase = useCases[i];
                            verifyStringContains(useCase.s, useCase.x, useCase.expected);
                        }
                    });
            });

        describe("Perform fromJSON unit testing",
            function() {

                it("JSON parse itslef is defined",
                    function() {
                        // ReSharper disable once PossiblyUnassignedProperty
                        expect(JSON).to.not.equal(undefined);
                        // ReSharper disable once PossiblyUnassignedProperty
                        expect(JSON.parse).to.not.equal(undefined);
                    });

                it("fromJSON static function is defined",
                    function() {
                        // ReSharper disable once PossiblyUnassignedProperty
                        expect(String.prototype.fromJSON).not.to.equal(undefined);
                    });
                // ReSharper disable once InconsistentNaming
                var verifyFromJSON = function(s, verify) {
                    var actual = s.fromJSON();
                    // ReSharper disable once PossiblyUnassignedProperty
                    expect(actual).to
                        // ReSharper disable once PossiblyUnassignedProperty
                        .be.a("object");
                    // ReSharper disable once PossiblyUnassignedProperty
                    expect(verify).to
                        // ReSharper disable once PossiblyUnassignedProperty
                        .be.a("function");
                    verify(actual);
                };

                it("run through the use cases",
                    function() {
                        // could get very much more elaborate here but this will work for now
                        var useCases = [
                            {
                                s: '{ "x": 1 }',
                                verify: function(obj) {
                                    // ReSharper disable once PossiblyUnassignedProperty
                                    expect(obj.x).to.equal(1);
                                }
                            },
                            {
                                s: '{ "arr": [1, 2, 3] }',
                                verify: function(obj) {
                                    // ReSharper disable once PossiblyUnassignedProperty
                                    expect(obj.arr).to
                                        // ReSharper disable once PossiblyUnassignedProperty
                                        .deep.equal([1, 2, 3]);
                                }
                            }
                        ];

                        for (var i = 0; i < useCases.length; i++) {
                            var useCase = useCases[i];
                            verifyFromJSON(useCase.s, useCase.verify);
                        }
                    });
            });
    });
