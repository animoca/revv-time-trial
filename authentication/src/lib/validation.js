var regexpValidator = (value, regexp, strict = true) => {
    if (!this.isString(value, strict)) {
        return false;
    }

    if (!regexp.test(value)) {
        return false;
    }

    return true;
}

module.exports.isString = (value, strict = true) => {
    if ((typeof value !== 'string') && !(value instanceof String)) {
        return false;
    }

    if (strict) {
        if (value.length == 0) {
            return false;
        }

        if (/^\s+.*$/.test(value) || /^.*\s+$/.test(value)) {
            return false;
        }
    }

    return true;
};

module.exports.isStringArray = (items, strict = true) => {
    if (!Array.isArray(items)) {
        return false;
    }

    return items.every((item) => {
        return this.isString(item, strict);
    });
};

module.exports.isNumber = (value, min, max) => {
    var n = Math.floor(Number(value));
    return n <= max && String(n) === value && n >= min;
}

module.exports.isUuid = (value, strict = true) => 
    regexpValidator(value, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, strict);
    
module.exports.isEmail = (value, strict = true) => 
    regexpValidator(value, /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i, strict);

module.exports.isEthereumWalletAddress = (value, strict = true) => regexpValidator(value, /^0x[0-9a-f]{40}$/i, strict);

module.exports.isHexAddress =  (value, strict = true) => regexpValidator(value, /^0x[0-9a-f]+$/i, strict);

module.exports.isObject = (value) => {
    return value && (typeof value === 'object') && !this.isString() && !Array.isArray(value);
};
