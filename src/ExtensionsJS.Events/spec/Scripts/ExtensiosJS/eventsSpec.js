/// <reference path="../../../node_modules/mocha/mocha.js"/>
/// <reference path="../../../node_modules/chai/chai.js"/>
/// <reference path="../../../Scripts/ExtensionsJS/events.js"/>

var expect = chai.expect;
var assert = chai.assert;

describe("Perform Events ExtensionsJS unit testing",
    function() {

        it("EventDispatcher setup static function is defined",
            function() {
                expect(EventDispatcher.setup).not.to.equal(undefined);
            });

        it("EventDispatcher teardown static function is defined",
            function() {
                expect(EventDispatcher.teardown).not.to.equal(undefined);
            });

        var target = {};

        var verifyTarget = function(obj, verify) {
            var o = obj;
            verify(o.__dispatcher,
                o.publish,
                o.unsubscribeAll,
                o.unsubscribe,
                o.subscribe,
                o.subscribeHashed,
                o.subscribeOne
            );
        };

        var hasHandlers = function(dispatcher) {
            expect(dispatcher).not.to.be.undefined.and.to.be.a("EventDispatcher");
            // expecting six handlers in all, arguments less the dispatcher
            expect(arguments).to.have.lengthOf(7);
            for (var i = 1; i < arguments.length; i++) {
            // ReSharper disable once WrongExpressionStatement
                expect(arguments[i]).not.to.be.undefined;
            }
        };

        /* While we do not recommend drilling into the Dispatcher like this in a production
        setting, taking the ExtensionsJS.Events dependency, this is sufficient for unit
        testing verification along the way. */
        var verifyDispatcherHasSubscriptions = function(obj) {
            var d = obj.__dispatcher;
            // ReSharper disable once WrongExpressionStatement
            expect(d).not.to.be.undefined;
            var s = d.__subscriptions;
            // ReSharper disable once WrongExpressionStatement
            expect(s).not.to.be.undefined;
            expect(arguments).to.have.lengthOf.at.least(2);
            for (var i = 1; i < arguments.length; i++) {
                var key = arguments[i].key;
                var callback = arguments[i].callback;
                // ReSharper disable once WrongExpressionStatement
                expect(s).to.have.any.keys(key);
                // we must deep include in this instance for it to work
                expect(s[key]).to.be.an("array").that.deep.includes({ callback: callback });
            }
        };

        describe("set up the target",
            function() {

                EventDispatcher.setup(target);
                verifyTarget(target, hasHandlers);

                var something = "something";

                var happened = function(sender) {
                    expect(sender).to.be.same(target);
                };

                describe("Subscribe with One callback",
                    function() {

                        var hashed = { something: happened };

                        it("subscribe one to something happened",
                            function() {

                                target.subscribeOne(something, happened);

                                /* this is a little bit deeper dive into the behind the scenes stuff
                                than I'd like at this level. */
                                expect(Object.keys(target.__dispatcher.__subscriptions)).to.have.lengthOf(1);

                                verifyDispatcherHasSubscriptions(target, { key: something, callback: happened });
                            });


                        it("subscribe to something happened",
                            function() {

                                target.subscribe(something, happened);

                                // ditto above, but it illustrates the functionaliy is working
                                expect(Object.keys(target.__dispatcher.__subscriptions)).to.have.lengthOf(1);

                                verifyDispatcherHasSubscriptions(target, { key: something, callback: happened });
                            });

                        it("subscribe one to hashed something happened",
                            function() {

                                target.subscribeHashed(hashed);

                                // ditto above, but it illustrates the functionaliy is working
                                expect(Object.keys(target.__dispatcher.__subscriptions)).to.have.lengthOf(1);

                                verifyDispatcherHasSubscriptions(target, { key: something, callback: happened });
                            });

                        it("subscribe to hashed something happened",
                            function() {

                                target.subscribe(hashed);

                                // ditto above, but it illustrates the functionaliy is working
                                expect(Object.keys(target.__dispatcher.__subscriptions)).to.have.lengthOf(1);

                                verifyDispatcherHasSubscriptions(target, { key: something, callback: happened });
                            });
                    });

                describe("tear down the target",
                    function() {

                        var doesNotHaveHandlers = function(dispatcher) {
                            // ReSharper disable once WrongExpressionStatement
                            expect(dispatcher).to.be.undefined;
                            // expecting six handlers in all, arguments less the dispatcher
                            expect(arguments).to.have.lengthOf(7);
                            for (var i = 1; i < arguments.length; i++) {
                            // ReSharper disable once WrongExpressionStatement
                                expect(arguments[i]).to.be.undefined;
                            }
                        };

                        it("target can be torn down",
                            function() {
                                verifyTarget(target, hasHandlers);
                                EventDispatcher.teardown(target);
                                verifyTarget(target, doesNotHaveHandlers);
                            });
                    });
            });
    });
