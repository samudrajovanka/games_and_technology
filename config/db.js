const mongoose = require('mongoose');

const uri = "mongodb+srv://wavesolid:sadam2903@gamesandtechno.cmiid.gcp.mongodb.net/gamesandtechno?retryWrites=true&w=majority";

// Connect to MongoDB
const connectDB = () => {
    mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true })
        .then(() => console.log("Database Connected...!"))
        .catch((err) => console.log(err));
}
module.exports = connectDB;