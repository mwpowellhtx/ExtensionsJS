if (Number.isNumeric === undefined) {
    Number.isNumeric = function (x) {
        return !isNaN(parseFloat(x)) && isFinite(x);
    }
}

if (Number.toBoolean === undefined) {
    Number.toBoolean = function (x) {

        /* 0 is false and anything else is deemed true */
        if (Number.isNumeric(x))
            return x === 0 ? false : true;

        /* returns undefined when x is not a numeric value */
        return undefined;
    }
}
