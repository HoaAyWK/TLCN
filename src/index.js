const express = require('express')
app = express()

const cors = require('cors')
const port = 5000
const route = require('./routers/route')
require('dotenv').config()

const db = require('./database/connect')
db.connectDB()

app.use(express.json())
app.use(cors())

route(app)


app.listen(port, () => console.log(`http://localhost:${port}`))