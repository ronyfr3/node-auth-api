const mongoose = require("mongoose")

const usersSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    userType: {
      type: String,
      default: "customer",
    },
    avatar: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png",
    },
  },
  {
    timestamps: true,
  }
)

module.exports =
  mongoose.models.Userlist || mongoose.model("Userlist", usersSchema)
