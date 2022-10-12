const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const route = require('./routes/route');
const { checkoutWebhook } = require('./controllers/checkoutController');
const errorHandlersMiddleware = require('./middlewares/errorHandlers');

const app = express();

app.post('/api/v1/webhook', express.raw({ type: 'application/json' }), checkoutWebhook);

app.use(express.json());
app.use(cors());
app.use(cookieParser());

route(app);

app.use(errorHandlersMiddleware);

module.exports = app;