// ReSharper disable once NativeTypePrototypeExtending
if (String.prototype.contains === undefined) {
    String.prototype.contains = function (s) {
        return this.indexOf(s) >= 0;
    }
}