const mongoose = require("mongoose");

const connectDatabase = () => {
    try {
        mongoose.connect(process.env.MONGO_ATLAS_URL);
        console.log("Connected to Database");
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = { connectDatabase };
