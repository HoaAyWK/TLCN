/**
 * Create an object composed of the picked object properties
 * @param {Object} object
 * @param {string[]} keys
 * @returns {Object}
 */
const pick = (object, keys) => {
    return keys.reduce((obj, key) => {
        if (object && Object.prototype.hasOwnProperty.call(object, key)) {
            if (key === 'name') {
                obj[key] = {
                    $regex: object[key],
                    $options: 'i',
                };
            } else {
              obj[key] = object[key];
            }
        }
        return obj;
    }, {});
};

module.exports = pick;
