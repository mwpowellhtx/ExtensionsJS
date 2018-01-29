/* ReSharper disable once NativeTypePrototypeExtending */
if (String.prototype.contains === undefined) {
    String.prototype.contains = function(s) {
        return this.indexOf(s) >= 0;
    }
}

/* ReSharper disable once NativeTypePrototypeExtending */
if (String.prototype.fromJSON === undefined) {
    String.prototype.fromJSON = function() {
        return JSON.parse(this);
    }
}
