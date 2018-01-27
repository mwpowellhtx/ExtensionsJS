// ReSharper disable NativeTypePrototypeExtending
if (Array.prototype.joinDelimited === undefined) {
    Array.prototype.joinDelimited = function(delim) {
        if (delim === undefined || delim === null) {
            delim = "-";
        }
        return this.join(delim);
    }
}

// ReSharper disable PossiblyUnassignedProperty
if (Array.range === undefined) {
    // define our own min and max functions
    var max = function() {
        var result = undefined;
        for (var i = 0; i < arguments.length; i++) {
            if (result === undefined || arguments[i] > result) {
                result = arguments[i];
            }
        }
        return result;
    }
    var min = function() {
        var result = undefined;
        for (var i = 0; i < arguments.length; i++) {
            if (result === undefined || arguments[i] < result) {
                result = arguments[i];
            }
        }
        return result;
    }
    Array.range = function(start, stop, step) {
        // TODO: TBD: does not work (yet) for elements such as characters; maybe that's a good thing, leave that conversion for another function...
        var r = [], x;
        // stepping by any amount or 1 (default)
        var s = step || 1;
        // make sure that the range is appropriate depending on the step
        if (s < 0) {
            x = max(start, stop);
            stop = min(start, stop);
        } else {
            x = min(start, stop);
            stop = max(start, stop);
        }
        // adaptive range stepping upwards or downwards
        while ((s > 0 && x <= stop) || (s < 0 && x >= stop)) {
            r.push(x);
            x += s;
        }
        return r;
    }
}

if (Array.prototype.any === undefined) {
    Array.prototype.any = function(pred) {
        pred = pred || function(a) { return a; };
        //// TODO: this one was anticipating ECMAScript 6; currently VS2013 supports ECMAScript 5
        //// TODO: TBD: might consider upgrading to VS2015 now; or is there an ECMAScript upgrade I can do?
        //for (let a of this) {
        for (var i = 0; i < this.length; i++) {
            if (pred(this[i])) {
                return true;
            }
        }
        return false;
    }
}

if (Array.prototype.all === undefined) {
    Array.prototype.all = function(pred) {
        pred = pred || function(a) { return a; };
        //for (let a of this) {
        for (var i = 0; i < this.length; i++) {
            if (!pred(this[i])) {
                return false;
            }
        }
        return true;
    }
}

// http://stackoverflow.com/questions/15298912/javascript-generating-combinations-from-n-arrays-with-m-elements
if (Array.prototype.combineWith === undefined) {
    Array.prototype.combineWith = function() {
        var r = [];
        // TODO: TBD: combine with elementary values? as well as array values?
        // ReSharper disable once PossiblyUnassignedProperty
        var arrs = [this].concat(Array.from(arguments));
        arrs.reduceRight(function(g, x, i) {
            return function(arr) {
                for (var j = 0, l = x.length; j < l; j++) {
                    var a = arr.slice(); // clone arr
                    a[i] = x[j];
                    g(a);
                }
            };
        }, Array.prototype.push.bind(r))(new Array(arrs.length));
        return r;
    }
}

// TODO: TBD: is "each" the same as every?
if (Array.prototype.each === undefined) {
    Array.prototype.each = function(action) {
        action = action || function() {};
        //for (let a of this) {
        for (var i = 0; i < this.length; i++) {
            action(this[i]);
        }
    }
}

if (Array.prototype.equals === undefined) {
    // http://stackoverflow.com/questions/22395357/how-to-compare-two-arrays-are-equal-using-javascript-or-jquery
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every
    Array.prototype.equals = function(other, pred) {
        pred = pred || function(x, y) { return x === y; };
        return Array.isArray(other) && this.length === other.length && this.every(function(x, j) { return pred(x, other[j]); });
    }
}

if (Array.prototype.front === undefined) {
    Array.prototype.front = function (pred) {
        // could use Array.prototype.find, but this is consistent within arr.js
        pred = pred || function() { return true; }
        //for (let a of this)
        for (var i = 0; i < this.length; i++) {
            var a = this[i];
            if (pred(a)) {
                return a;
            }
        }
        return null;
    }
}

if (Array.prototype.back === undefined) {
    Array.prototype.back = function(pred) {
        // could use Array.prototype.find, but this is consistent within arr.js
        pred = pred || function() { return true; }
        //for (let a of this)
        for (var i = this.length - 1; i >= 0; i--) {
            var a = this[i];
            if (pred(a)) {
                return a;
            }
        }
        return null;
    }
}

// TODO: could potentially turn these into Deque operations as well (one of my favorite data structures ever)

// 'select' may be more of a conflict than is worth it; instead we will name it 'project' i.e. 'projection'
if (Array.prototype.project === undefined) {
    Array.prototype.project = function(getter) {
        // either apply the getter across the array or return itself
        getter = getter || function(x) { return x; };
        var selected = [];
        //for (let a of this) {
        for (var i = 0; i < this.length; i++) {
            selected.push(getter(this[i]));
        }
        return selected;
    }
}

if (Array.prototype.projectMany === undefined) {
    Array.prototype.projectMany = function(getter) {
        getter = getter || function(x) { return x; };
        // flatten this Array first then apply the getter
        var concatenate = function(a) {
            // which handles an arbitrarily deep level of arrays
            return a.reduce(function(b, x) {
                    return b.concat(Array.isArray(x) ? concatenate(x) : x);
                },
                []);
        };
        var flattened = concatenate(this);
        var r = [];
        for (var i = 0; i < flattened.length; i++) {
            r.push(getter(flattened[i]));
        }
        return r;
    }
}

if (Array.prototype.sum === undefined) {
    Array.prototype.sum = function(getter) {
        getter = getter || function(x) { return x; };
        var r = 0;
        //for (let a of this) {
        for (var i = 0; i < this.length; i++) {
            r += getter(this[i]);
        }
        return r;
    }
}

if (Array.prototype.where === undefined) {
    Array.prototype.where = function(match) {
        match = match || function() { return true; }
        var r = [];
        //for (let a of this) {
        for (var i = 0; i < this.length; i++) {
            var x = this[i];
            if (match(x)) {
                r.push(x);
            }
        }
        return r;
    }
}

if (Array.prototype.max === undefined) {
    Array.prototype.max = function() {
        return Math.max.apply(null, this);
    }
}

if (Array.prototype.min === undefined) {
    Array.prototype.min = function() {
        return Math.min.apply(null, this);
    }
}