require('dotenv').config();
const express = require('express');
const cors = require('cors');

const route = require('./routes/route');
const { connectDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;
console.log(PORT);

app.use(express.json());
app.use(cors());

route(app);

connectDatabase();

app.listen(PORT, () => console.log(`Server listenning on port: ${PORT} in ${process.env.NODE_ENV} mode.`));