const objectId = (value, helpers) => {
    if (!value.match(/^[0-9a-fA-F]{24}/)) {
        return helpers.message('"{{#label}}" must be a valid mongo id');
    }
    
    return value;
};

const password = (value, helpers) => {
    if (value.length < 6) {
      return helpers.message('password must be at least 6 characters');
    }
    return value;
};

const username = (value, helpers) => {
    if (username.length < 2 || username.length > 100) {
        return helpers.message('name must be between 2 to 100 characters');
    }

    return value;
};

const categoryName = (value, helpers) => {
    if (categoryName.length < 2 || categoryName.length > 50) {
        return helpers.message('name must be between 2 to 50 characters')
    }

    return value;
};

module.exports = {
    objectId,
    password,
    username,
    categoryName
};