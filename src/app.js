const express = require('express');
const cors = require('cors');

const route = require('./routes/route');
const errorHandlersMiddleware = require('./middlewares/errorHandlers');

const app = express();

app.use(express.json());
app.use(cors());

route(app);

app.use(errorHandlersMiddleware);

module.exports = app;