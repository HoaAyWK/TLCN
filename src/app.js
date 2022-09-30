const express = require('express');
const cors = require('cors');

const route = require('./routes/route');

const app = express();

app.use(express.json());
app.use(cors());

route(app);

module.exports = app;