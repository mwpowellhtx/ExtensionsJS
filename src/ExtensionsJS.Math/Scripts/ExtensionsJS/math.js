if (Math.limit === undefined) {
    Math.limit = function(x, min, max) {
        return Math.min(max, Math.max(min, x));
    }
}
