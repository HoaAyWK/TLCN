const authRoute = require('./auth');
const userRoute = require('./user');

const route = (app) => {
    app.use('/api/v1', authRoute);
    app.use('/api/v1', userRoute);
};

module.exports = route;