const authRoute = require('./auth');
const categoryRoute = require('./category');
const userRoute = require('./user');

const route = (app) => {
    app.use('/api/v1', authRoute);
    app.use('/api/v1', userRoute);
    app.use('/api/v1', categoryRoute);
};

module.exports = route;