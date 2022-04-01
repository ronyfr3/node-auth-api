const mongoose = require("mongoose")

const connectDB = async () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log(
        `mongodb connection established with server: ${data.connection.host}`
      )
    })
}

module.exports = connectDB
