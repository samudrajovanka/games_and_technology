const mongoose = require ('mongoose');

const uri = "mongodb+srv://wavesolid:sa2903dam@gamesandtechnology.w1qch.mongodb.net/Gamesandtechnology?retryWrites=true&w=majority";
const connectDB = () => { mongoose.connect(uri, { useUnifiedTopology : true, useNewUrlParser: true })
    .then(() => console.log("Database Connected...!"))
    .catch((err) => {`error = ${err}`});
}
 module.exports = connectDB;