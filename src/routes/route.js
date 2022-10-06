const authRoute = require('./auth');
const categoryRoute = require('./category');
const userRoute = require('./user');
const pointRoute = require('./point');
// const jobRoute = require('./job');

const route = (app) => {
    app.use('/api/v1', authRoute);
    app.use('/api/v1', userRoute);
    app.use('/api/v1', categoryRoute);
    app.use('/api/v1', pointRoute);
    // app.use('/api/v1', jobRoute);
};

module.exports = route;