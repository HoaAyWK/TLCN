const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const route = require('./routes/route');
const errorHandlersMiddleware = require('./middlewares/errorHandlers');

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

route(app);

app.use(errorHandlersMiddleware);

module.exports = app;