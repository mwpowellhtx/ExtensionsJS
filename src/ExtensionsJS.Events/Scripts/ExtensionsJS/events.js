var EventDispatcher = function(target) {

    this.__target = target;

    var ctrl = this;

    // TODO: TBD: loosely inspired by the article: http://michd.me/blog/event-driven-javascript-a-simple-event-dispatcher/
    // TODO: TBD: loosely inspired by the article: http://github.com/michd/step-sequencer/blob/master/assets/js/eventdispatcher.js
    // TODO: TBD: priority queue of callbacks might be an interesting feature to provide here...
    // TODO: TBD: could support some sort of logging to console here as well I suppose, but not right now...
    ctrl.__subscriptions = [];

    this.__findSubscription = function(e) {
        var subs = ctrl.__subscriptions;
        /* really, really, really strange... so, this was not working and not working and
        not working, until I added console logging (of any sort? i.e. WriteLine? log?),
        then suddenly it started working. So ostensibly, plausibly, something was jarred
        loose in the tooling JavaScript runtime? */
        /* TODO: TBD: no, this may be a test scope issue after all... if I just run this test
        it works. but if I run this in the context of a parent describe node, then things fall
        apart. so perhaps I need to establish describe scopes that include these paths as well... */
        var sub = undefined;
        for (var i = 0; subs.length; i++) {
            if (subs[i].__e === e) {
                sub = subs[i];
                break;
            }
        }
        return sub;
    }

    var findOrCreateSubscription = function(ctrl, e) {

        var subs = ctrl.__subscriptions;

        // let's also leverage the scope of the Sub and the E...
        var createSubscription = function(x) {
            (x = x || []).__e = e;
            return x;
        };

        var sub = ctrl.__findSubscription(e);

        if (sub === undefined) {
            sub = createSubscription(sub);
            subs.push(sub);
        }

        return sub;
    };

    /**
     * Subscribes One Callback for the specified event E.
     * @param {string} e 
     * @param {function} callback 
     */
    this.subscribeOne = function(e, callback) {

        findOrCreateSubscription(ctrl, e).push(callback);

        return ctrl;
    };

    /**
     * Subscribes as many Callbacks as are specified by the associative object Hashed.
     * @param {Object} hashed 
     */
    this.subscribeHashed = function(hashed) {

        for (var e in hashed) {
            if (hashed.hasOwnProperty(e)) {
                ctrl.subscribeOne(e, hashed[e]);
            }
        }

        return ctrl;
    };

    /**
     * Subscribes to the Event or the Hashed events.
     * @param {String || Object} eOrHashed The Event Name or a Hashed Callback Object
     * @param {} callback Optional. The Callback when eOrHashed is the Event Name. Otherwise ignored.
     */
    this.subscribe = function(eOrHashed, callback) {

        // This is a little peculiar, but not especially considering JavaScript...
        if ((eOrHashed instanceof String || typeof eOrHashed === "string") && callback instanceof Function) {
            return ctrl.subscribeOne(eOrHashed, callback);
        }

        if (eOrHashed instanceof Object && callback === undefined) {
            return ctrl.subscribeHashed(eOrHashed);
        }

        return ctrl;
    };

    /**
     * Unsubscribes from the Event
     * @param {String} e An Event Name from which to unsubscribe
     * @param {} existingCallback An existing Callback function
     */
    this.unsubscribe = function(e, existingCallback) {

        var sub = ctrl.__findSubscription(e);

        var remove = function(a, x) {
            var i;
            if (a && (i = a.indexOf(x)) >= 0) {
                a.splice(i, 1);
            }
        };

        // Remove the Callback first, followed by the Subscriptions themselves if necessary.
        if (sub !== undefined) {
            remove(sub, existingCallback);
            // ReSharper disable once QualifiedExpressionMaybeNull
            if (!sub.length) {
                remove(ctrl.__subscriptions, sub);
            }
        }

        return ctrl;
    };

    /**
     * Unsubscribes all of the Callbacks associated with the Event.
     * @param {String} e An Event Name from which to Unsubscribe All Callbacks
     */
    this.unsubscribeAll = function(e) {

        var sub = ctrl.__findSubscription(e);

        if (sub) {
            var subs = ctrl.__subscriptions;
            var i = subs.indexOf(sub);
            subs.splice(i, 1);
        }

        return ctrl;
    };

    /**
     * Publishes the Args to the event associated with the Event Name.
     * @param {String} e An Event Name
     * @param {any} args An Array of arguments are passed to your callback as the values themselves whereas non-array arguments are passed as-is
     * @param {Object} may be any Object which the caller wants to bind to the Callback
     */
    this.publish = function(e, args, context) {
        // TODO: TBD: I'm still not positive the value of 'context', if it isn't __target already...
        var sub = ctrl.__findSubscription(e);
        if (sub) {
            // Believe it or not, Null is stronger than Undefined with JavaScript.
            context = context || null;
            for (var i = 0; i < sub.length; i++) {
                var a = [ctrl.__target];
                if (args) {
                    a = a.concat(Array.isArray(args) ? args : [args]);
                }
                sub[i].apply(context, a);
            }
        }
        return ctrl;
    }
}

if (EventDispatcher.setup === undefined) {
    /**
     * Sets up an Event Dispatcher associated with the Target.
     * @param {any} target A Target on which to setup an Event Dispatcher.
     */
    EventDispatcher.setup = function(target) {
        var d = new EventDispatcher(target);
        target.__dispatcher = d;
        target.subscribeOne = d.subscribeOne;
        target.subscribeHashed = d.subscribeHashed;
        target.subscribe = d.subscribe;
        target.unsubscribe = d.unsubscribe;
        target.unsubscribeAll = d.unsubscribeAll;
        target.publish = d.publish;
    }
}

if (EventDispatcher.teardown === undefined) {
    /**
     * Tears down the Event Dispatcher associated with the Target.
     * @param {any} target A Target from which to tear down the Event Dispatcher.
     */
    EventDispatcher.teardown = function(target) {
        delete target.publish;
        delete target.unsubscribeAll;
        delete target.unsubscribe;
        delete target.subscribe;
        delete target.subscribeHashed;
        delete target.subscribeOne;
        delete target.__dispatcher;
    }
}

/* Extending the Object Prototype is likely causing problems, so will back off of that much for the time being. */
