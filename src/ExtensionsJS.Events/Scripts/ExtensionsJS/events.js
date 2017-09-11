var EventDispatcher = function() {
    // TODO: TBD: loosely inspired by the article: http://michd.me/blog/event-driven-javascript-a-simple-event-dispatcher/
    // TODO: TBD: loosely inspired by the article: http://github.com/michd/step-sequencer/blob/master/assets/js/eventdispatcher.js
    // TODO: TBD: priority queue of callbacks might be an interesting feature to provide here...
    // TODO: TBD: could support some sort of logging to console here as well I suppose, but not right now...
    this.__subscriptions = [];

    /**
     * Subscribes One Callback for the specified event E.
     * @param {string} e 
     * @param {function} callback 
     */
    this.subscribeOne = function(e, callback) {

        var subscriptions = this.__dispatcher.__subscriptions;

        // TODO: TBD: typeof subscribed === "undefined", or this...
        var subscribers = subscriptions[e] || (subscriptions[e] = []);

        subscribers.push({ callback: callback });

        return this;
    };

    /**
     * Subscribes as many Callbacks as are specified by the associative object Hashed.
     * @param {Object} hashed 
     */
    this.subscribeHashed = function(hashed) {

        var e;

        for (e in hashed) {
            if (hashed.hasOwnProperty(e)) {
                this.subscribeOne(e, hashed[e]);
            }
        }

        return this;
    };

    /**
     * Subscribes to the Event or the Hashed events.
     * @param {String || Object} eOrHashed The Event Name or a Hashed Callback Object
     * @param {} callback Optional. The Callback when eOrHashed is the Event Name. Otherwise ignored.
     */
    this.subscribe = function(eOrHashed, callback) {

        if (eOrHashed instanceof Object) {
            return this.subscribeHashed(eOrHashed);
        }

        if (eOrHashed instanceof String) {
            return this.subscribeOne(eOrHashed, callback);
        }

        return this;
    };

    /**
     * Unsubscribes from the Event
     * @param {String} e An Event Name from which to unsubscribe
     * @param {} existingCallback An existing Callback function
     */
    this.unsubscribe = function(e, existingCallback) {

        var subscriptions = this.__dispatcher.__subscriptions;

        var subscribers = subscriptions[e] || [];

        var i = subscribers.indexOf(existingCallback);

        if (i >= 0) {
            // Remove the callback from the subscribed callbacks.
            subscribers.splice(i, 1);
        }

        if (subscribers.length === 0) {
            delete subscriptions[e];
        }

        return this;
    };

    /**
     * Unsubscribes all of the Callbacks associated with the Event.
     * @param {String} e An Event Name from which to Unsubscribe All Callbacks
     */
    this.unsubscribeAll = function(e) {

        var subscriptions = this.__dispatcher.__subscriptions[e];

        if (subscriptions[e] !== undefined) {
            delete subscriptions[e];
        }

        return this;
    };

    /**
     * Publishes the Args to the event associated with the Event Name.
     * @param {String} e An Event Name
     * @param {any} args The arguments to pass along to the Callbacks Subscribed to the Event
     * @param {} context 
     */
    this.publish = function(e, args, context) {

        var subscriptions = this.__dispatcher.__subscriptions;

        // TODO: TBD: may want to incorporate some sort of logging throughout here...
        var subscribers = subscriptions[e] || [];

        //// TODO: TBD: why?
        //args = args instanceof Array ? args : [args];

        //// TODO: TBD: App? may or may not want that, per se...
        //context = context || App;

        var length = subscribers.length;

        if (length > 0) {

            var sender, i;

            // TODO: TBD: assume this is a sane context, or use the context argument?
            for (sender = this, i = 0; i < length; i++) {
                // TODO: TBD: no need to apply anything here? just call it? but for perhaps "this" confusion...
                subscribers[i].callback(sender, args);
            }
        }

        return this;
    }
}

if (EventDispatcher.setup === undefined) {
    /**
     * Sets up an Event Dispatcher associated with the Target.
     * @param {any} target A Target on which to setup an Event Dispatcher.
     */
    EventDispatcher.setup = function(target) {
        var dispatcher = new EventDispatcher();
        target.__dispatcher = dispatcher;
        target.subscribeOne = dispatcher.subscribeOne;
        target.subscribeHashed = dispatcher.subscribeHashed;
        target.subscribe = dispatcher.subscribe;
        target.unsubscribe = dispatcher.unsubscribe;
        target.unsubscribeAll = dispatcher.unsubscribeAll;
        target.publish = dispatcher.publish;
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

if (Object.setupTypeEventDispatcher === undefined) {
    Object.setupTypeEventDispatcher = function() {
        EventDispatcher.setup(this);
    }
}

if (Object.prototype.setupEventDispatcher === undefined) {
    // ReSharper disable once NativeTypePrototypeExtending
    Object.prototype.setupEventDispatcher = function() {
        EventDispatcher.setup(this);
    }
}

if (Object.teardownTypeEventDispatcher === undefined) {
    Object.teardownTypeEventDispatcher = function() {
        EventDispatcher.teardown(this);
    }
}

if (Object.prototype.teardownEventDispatcher === undefined) {
    // ReSharper disable once NativeTypePrototypeExtending
    Object.prototype.teardownEventDispatcher = function() {
        EventDispatcher.teardown(this);
    }
}
