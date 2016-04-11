if (Boolean.parse === undefined) {
    Boolean.parse = function(a) {

        /* TODO: TBD: could get fancier here and decide whether a valid, parsed numeric value is 0 (false) or anything else (true). */
        if (typeof (a) === "string") {
            switch (a.toLowerCase()) {
            case "true":
            case "yes":
            case "1":
                return true;
            case "false":
            case "no":
            case "0":
                return false;
            }
        }

        /* also avoid taking the dependency on Number.js, even though that offers the same sort of functionality. */
        var isNumeric = function(x) {
            return !isNaN(parseFloat(x)) && isFinite(x);
        };

        if (isNumeric(a))
            return a === 0 ? false : true;

        return undefined;
    }
}
