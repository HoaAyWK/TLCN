const authRoute = require('./auth');

const route = (app) => {
    app.use('/api/v1', authRoute);
};

module.exports = route;