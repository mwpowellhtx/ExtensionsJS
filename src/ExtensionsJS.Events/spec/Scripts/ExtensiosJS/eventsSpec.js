/// <reference path="../../../node_modules/mocha/mocha.js"/>
/// <reference path="../../../node_modules/chai/chai.js"/>
/// <reference path="../../../Scripts/ExtensionsJS/events.js"/>

var expect = chai.expect;
var assert = chai.assert;

describe("Perform Events ExtensionsJS unit testing",
    function() {

        var target;

        var defaultCallback = function(sender) {
            // Target should be defined by this point.
            // ReSharper disable once WrongExpressionStatement, PossiblyUnassignedProperty
            expect(target).not.to
                // ReSharper disable once PossiblyUnassignedProperty
                .be.undefined;
            // And Sender should be the Same as Target.
            // ReSharper disable once PossiblyUnassignedProperty
            expect(sender).to.equal(target);
        };

        var opts = {
            anything: "anything",
            something: "something",
            // Anything: Happening?
            happening: defaultCallback,
            // Something: Happened!
            happened: defaultCallback,
            // Something: Happened!
            again: defaultCallback
        };

        describe("Vet that EventDispatcher is available and correct",
            function() {

                it("EventDispatcher is defined properly",
                    function() {
                        // ReSharper disable once PossiblyUnassignedProperty
                        expect(EventDispatcher).to
                            // ReSharper disable once PossiblyUnassignedProperty
                            .be.a("function");
                    });

                it("EventDispatcher setup static function is defined",
                    function() {
                        // ReSharper disable once PossiblyUnassignedProperty
                        expect(EventDispatcher.setup).not.to.equal(undefined);
                    });

                it("EventDispatcher teardown static function is defined",
                    function() {
                        // ReSharper disable once PossiblyUnassignedProperty
                        expect(EventDispatcher.teardown).not.to.equal(undefined);
                    });
            });

        describe("Further vet that EventDispatcher.prototype functions are also available",
            function() {

                var x, d;

                beforeEach(function() {
                    x = {};
                    EventDispatcher.setup(x);
                    // ReSharper disable once WrongExpressionStatement, PossiblyUnassignedProperty
                    expect(d = x.__dispatcher).to.not
                        // ReSharper disable once PossiblyUnassignedProperty
                        .be.undefined;
                });

                afterEach(function() {
                    d = undefined;
                    EventDispatcher.teardown(x);
                    // ReSharper disable once WrongExpressionStatement, PossiblyUnassignedProperty
                    expect(x.__dispatcher).to
                        // ReSharper disable once PossiblyUnassignedProperty
                        .be.undefined;
                });

                it("Perform the vetting",
                    function() {
                        // ReSharper disable once PossiblyUnassignedProperty
                        expect(d.subscribeOne).to
                            // ReSharper disable once PossiblyUnassignedProperty
                            .be.a("function");
                        // ReSharper disable once PossiblyUnassignedProperty
                        expect(d.subscribeHashed).to
                            // ReSharper disable once PossiblyUnassignedProperty
                            .be.a("function");
                        // ReSharper disable once PossiblyUnassignedProperty
                        expect(d.subscribe).to
                            // ReSharper disable once PossiblyUnassignedProperty
                            .be.a("function");
                        // ReSharper disable once PossiblyUnassignedProperty
                        expect(d.unsubscribe).to
                            // ReSharper disable once PossiblyUnassignedProperty
                            .be.a("function");
                        // ReSharper disable once PossiblyUnassignedProperty
                        expect(d.unsubscribeAll).to
                            // ReSharper disable once PossiblyUnassignedProperty
                            .be.a("function");
                        // ReSharper disable once PossiblyUnassignedProperty
                        expect(d.publish).to
                            // ReSharper disable once PossiblyUnassignedProperty
                            .be.a("function");
                        // ReSharper disable once PossiblyUnassignedProperty
                        expect(d.__subscriptions).to
                            // ReSharper disable once PossiblyUnassignedProperty
                            .be.a("array");
                        // ReSharper disable once PossiblyUnassignedProperty
                        expect(d.__target).to
                            // ReSharper disable once PossiblyUnassignedProperty
                            .be.a("object")
                            // ReSharper disable once PossiblyUnassignedProperty
                            .and.to.equal(x);
                        // ReSharper disable once PossiblyUnassignedProperty
                        expect(d.__findSubscription).to
                            // ReSharper disable once PossiblyUnassignedProperty
                            .be.a("function");
                    });
            });

        describe("Perform routine subscriptions",
            function() {

                var makeTarget = function() {
                    var x = {};
                    // ReSharper disable once WrongExpressionStatement, PossiblyUnassignedProperty
                    expect(x).not.to
                        // ReSharper disable once PossiblyUnassignedProperty
                        .be.undefined;
                    return x;
                };

                var verifyTarget = function(t, verify) {
                    verify(t.__dispatcher,
                        t.publish,
                        t.unsubscribeAll,
                        t.unsubscribe,
                        t.subscribe,
                        t.subscribeHashed,
                        t.subscribeOne
                    );
                };

                beforeEach(function() {

                    var hasHandlers = function(dispatcher) {
                        // ReSharper disable once PossiblyUnassignedProperty
                        expect(dispatcher).not.to
                            // ReSharper disable once PossiblyUnassignedProperty
                            .be.undefined
                            // ReSharper disable once PossiblyUnassignedProperty
                            .and.to
                            // ReSharper disable once PossiblyUnassignedProperty
                            .be.a("EventDispatcher");
                        // expecting six handlers in all, arguments less the dispatcher
                        // ReSharper disable once PossiblyUnassignedProperty
                        expect(arguments).to
                            // ReSharper disable once PossiblyUnassignedProperty
                            .have.lengthOf(7);
                        for (var i = 1; i < arguments.length; i++) {
                            // ReSharper disable once WrongExpressionStatement, PossiblyUnassignedProperty
                            expect(arguments[i]).not.to
                                // ReSharper disable once PossiblyUnassignedProperty
                                .be.undefined;
                        }
                    };

                    // ReSharper disable once WrongExpressionStatement
                    EventDispatcher.setup(target = makeTarget());

                    verifyTarget(target, hasHandlers);
                });

                afterEach(function() {

                    var doesNotHaveHandlers = function(dispatcher) {
                        // ReSharper disable once WrongExpressionStatement, PossiblyUnassignedProperty
                        expect(dispatcher).to
                            // ReSharper disable once PossiblyUnassignedProperty
                            .be.undefined;
                        // expecting six handlers in all, arguments less the dispatcher
                        // ReSharper disable once PossiblyUnassignedProperty
                        expect(arguments).to
                            // ReSharper disable once PossiblyUnassignedProperty
                            .have.lengthOf(7);
                        for (var i = 1; i < arguments.length; i++) {
                            // ReSharper disable once WrongExpressionStatement, PossiblyUnassignedProperty
                            expect(arguments[i]).to
                                // ReSharper disable once PossiblyUnassignedProperty
                                .be.undefined;
                        }
                    };

                    // ReSharper disable once WrongExpressionStatement
                    EventDispatcher.teardown(target);

                    verifyTarget(target, doesNotHaveHandlers);
                });

                var makeHashed = function(init) {
                    init = init || function(x) { return x; };
                    return init({});
                };

                var getDispatcher = function(x) {
                    var d = x.__dispatcher;
                    // ReSharper disable once WrongExpressionStatement, PossiblyUnassignedProperty
                    expect(d).not.to
                        // ReSharper disable once PossiblyUnassignedProperty
                        .be.undefined;
                    return d;
                };

                var getSubscriptions = function(x) {
                    var subs = getDispatcher(x).__subscriptions;
                    // ReSharper disable once PossiblyUnassignedProperty
                    expect(subs).to
                        // ReSharper disable once PossiblyUnassignedProperty
                        .be.a("array");
                    return subs;
                };

                var verifySubscriptionCount = function(x, e, expectedCount) {
                    var d = getDispatcher(x);
                    if (e) { // given an event...
                        var sub = d.__findSubscription(e);
                        // similar as with other instance checks...
                        if (expectedCount instanceof Number || typeof expectedCount === "number") {
                            // ReSharper disable once WrongExpressionStatement, PossiblyUnassignedProperty
                            expect(sub).not.to
                                // ReSharper disable once PossiblyUnassignedProperty
                                .be.undefined;
                            // ReSharper disable once PossiblyUnassignedProperty
                            expect(sub).to
                                // ReSharper disable once PossiblyUnassignedProperty
                                .have.lengthOf(expectedCount);
                        } else {
                            // ReSharper disable once WrongExpressionStatement, PossiblyUnassignedProperty
                            expect(sub).to
                                // ReSharper disable once PossiblyUnassignedProperty
                                .be.undefined;
                        }
                    } else {
                        // ReSharper disable once WrongExpressionStatement, PossiblyUnassignedProperty
                        expect(d.__subscriptions).to
                            // ReSharper disable once PossiblyUnassignedProperty
                            .be.a("array")
                            // ReSharper disable once PossiblyUnassignedProperty
                            .and.to
                            // ReSharper disable once PossiblyUnassignedProperty
                            .be.empty;
                    }
                }


                describe("Target can receive subscriptions",
                    function() {

                        it("EventDispatcher.prototype.subscribeOne works",
                            function() {
                                target.subscribeOne(opts.something, opts.happened);
                                verifySubscriptionCount(target, opts.something, 1);
                            });

                        it("EventDispatcher.prototype.subscribe works",
                            function() {
                                target.subscribe(opts.something, opts.happened);
                                verifySubscriptionCount(target, opts.something, 1);
                            });

                        var hashed = makeHashed(x => {
                            x[opts.something] = opts.happened;
                            return x;
                        });

                        it("EventDispatcher.prototype.subscribeHashed works",
                            function() {
                                target.subscribeHashed(hashed);
                                verifySubscriptionCount(target, opts.something, 1);
                            });

                        it("EventDispatcher.prototype.subscribe hashed works",
                            function() {
                                target.subscribe(hashed);
                                verifySubscriptionCount(target, opts.something, 1);
                            });
                    });

                // emulation useful during unsubscription as well as publication...
                var emulateSubscription = function(x, e) {
                    var subs = getSubscriptions(x);
                    var sub = [];
                    for (var i = 2; i < arguments.length; i++) {
                        sub.push(arguments[i]);
                    }
                    sub.__e = e;
                    subs.push(sub);
                };

                describe("Subscriptions can be removed from target",
                    function() {

                        /* We do not need to full-on subscribe via the API. We just need to emulate
                        that subscriptions in fact exist. By that we just need to build up the data. */
                        beforeEach(function() {
                            emulateSubscription(target, opts.something, opts.happened, opts.again);
                        });

                        it("Unsubscribe from something happened",
                            function() {
                                target.unsubscribe(opts.something, opts.happened);
                                verifySubscriptionCount(target, opts.something, 1);
                            });

                        it("Unsubscribe from all",
                            function() {
                                target.unsubscribeAll(opts.something);
                                verifySubscriptionCount(target, opts.something);
                                // in fact, vet broader than the single event request...
                                verifySubscriptionCount(target);
                            });
                    });

                describe("Event publications work as expected",
                    function() {

                        var count;

                        var verifyCount = function(expectedCount) {
                            // ReSharper disable once PossiblyUnassignedProperty
                            expect(expectedCount).to.equal(count);
                        };

                        describe("That event can be published",
                            function() {

                                beforeEach(function() {
                                    count = 0;
                                    emulateSubscription(target, opts.something, opts.happened, s => { ++count; });
                                    verifyCount(0);
                                });

                                it("Perform the argument vetting",
                                    function() {
                                        target.publish(opts.something);
                                        verifyCount(1);
                                    });
                            });

                        // ReSharper disable once InconsistentNaming
                        var _1 = "abc",
                            // ReSharper disable once InconsistentNaming
                            _2 = 123;

                        describe("That simple arguments are passed correctly",
                            function() {

                                beforeEach(function() {
                                    count = 0;
                                    emulateSubscription(target,
                                        opts.something,
                                        opts.happened,
                                        (s, a, x) => {
                                            ++count;
                                            // ReSharper disable once PossiblyUnassignedProperty
                                            expect(a).to.equal(_1);
                                            // ReSharper disable once PossiblyUnassignedProperty
                                            expect(x).to.equal(_2);
                                        });
                                    verifyCount(0);
                                });

                                it("Perform the argument vetting",
                                    function() {
                                        target.publish(opts.something, [_1, _2]);
                                        verifyCount(1);
                                    });
                            });

                        describe("That array enclosed object arguments are passed correctly",
                            function() {

                                beforeEach(function() {
                                    count = 0;
                                    emulateSubscription(target,
                                        opts.something,
                                        opts.happened,
                                        (s, obj) => {
                                            ++count;
                                            // ReSharper disable once WrongExpressionStatement, PossiblyUnassignedProperty
                                            expect(obj).to
                                                // ReSharper disable once PossiblyUnassignedProperty
                                                .be.a("object")
                                                // ReSharper disable once PossiblyUnassignedProperty
                                                .and.to
                                                // ReSharper disable once PossiblyUnassignedProperty
                                                .deep.equal({ a: _1, x: _2 });
                                        });
                                    verifyCount(0);
                                });

                                it("Perform the argument vetting",
                                    function() {
                                        // Which should be just another argument in the array of parameters.
                                        target.publish(opts.something, [{ a: _1, x: _2 }]);
                                        verifyCount(1);
                                    });
                            });

                        describe("That simple object arguments are passed correctly",
                            function() {

                                beforeEach(function() {
                                    count = 0;
                                    emulateSubscription(target,
                                        opts.something,
                                        opts.happened,
                                        (s, obj) => {
                                            ++count;
                                            // ReSharper disable once WrongExpressionStatement, PossiblyUnassignedProperty
                                            expect(obj).to
                                                // ReSharper disable once PossiblyUnassignedProperty
                                                .be.a("object")
                                                // ReSharper disable once PossiblyUnassignedProperty
                                                .and.to
                                                // ReSharper disable once PossiblyUnassignedProperty
                                                .deep.equal({ a: _1, x: _2 });
                                        });
                                    verifyCount(0);
                                });

                                it("Perform the argument vetting",
                                    function() {
                                        // Arguments should be accepted without an array as well.
                                        target.publish(opts.something, { a: _1, x: _2 });
                                        verifyCount(1);
                                    });
                            });

                        // TODO: TBD: I'm on the fence as to the efficacy of "context" ... is it really necessary, and how might it be different from the __target ... ?
                    });
            });
    });
