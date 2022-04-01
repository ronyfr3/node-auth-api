process.on("uncaughtException", (err) => {
  console.log(
    `server is shutting down due to uncaught exception: ${err.message} ${err.stack}`
  )
})

require("dotenv").config()
const express = require("express")
const cors = require("cors")

//app initialization
const app = express()
//require db
const connect = require("./config/db")
connect()

//body-parser
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//cors
app.use(cors())

app.get("/", (req, res) => {
  res.status(200).send(`app is running the server at port: ${PORT}`)
})

// Routes
app.use("/api/users", require("./routes/auth"))

app.use(require("./middleware/error"))

let PORT = process.env.PORT || 8080

const server = app.listen(PORT, () =>
  console.log(`server is running at port ${PORT}`)
)

process.on("unhandledRejection", (err) => {
  console.log(
    "shutting down server due to unhandled promise rejection. Error: " +
      err.message
  )
  server.close(() => {
    process.exit(1)
  })
})
