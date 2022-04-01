const User = require("../model/auth")
const ErrorHandler = require("../utils/errorHandler")
const AsyncErrorHandler = require("../middleware/catchAsyncError")

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")

const userCtrl = {
  register: AsyncErrorHandler(async (req, res, next) => {
    const {name, email, password} = req.body

    if (!name || !email || !password)
      return next(new ErrorHandler("Please fill in all fields.", 406))

    if (!validateEmail(email))
      return next(new ErrorHandler("Invalid emails.", 406))

    const user = await User.findOne({email})
    if (user) return next(new ErrorHandler("Email already exists.", 409))

    if (password.length < 6)
      return next(
        new ErrorHandler("Password must be at least 6 characters.", 406)
      )

    //HASHED PASSWORD
    const passwordHash = await bcrypt.hash(password, 12)

    const newUser = await User.create({
      name,
      email,
      password: passwordHash,
    })

    // return new user
    res.status(201).json({
      message: "Registration Successfull",
      newUser,
    })
  }),
  login: AsyncErrorHandler(async (req, res, next) => {
    const {email, password} = req.body

    if (!email || !password)
      return next(new ErrorHandler("Please fill in all fields.", 406))

    const user = await User.findOne({email})

    if (!user) return next(new ErrorHandler("Email does not exist.", 400))

    //PASSWORD MATCH CHECK
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) return next(new ErrorHandler("Password is incorrect.", 400))

    const refresh_token = createRefreshToken({id: user._id})

    res.status(200).json({
      message: "Login Successfull",
      refreshToken: refresh_token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isUsed: user.isUsed,
      },
    })
  }),

  resetPassword: AsyncErrorHandler(async (req, res, next) => {
    const {password, email} = req.body
    const user = await User.findOne({email})
    if (!user) return next(new ErrorHandler("Email does not exist.", 400))

    if (!password)
      return next(new ErrorHandler("please enter your password", 400))

    const passwordHash = await bcrypt.hash(password, 12)

    await User.findOneAndUpdate(
      {_id: req.user.id},
      {
        password: passwordHash,
      }
    )

    res.status(200).json({msg: "Password successfully changed!"})
  }),
  getUser: AsyncErrorHandler(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(
        new ErrorHandler(`No user found with id:${req.params.id}`, 404)
      )
    }
    const user = await User.findById(req.params.id).select("-password")
    res.status(200).json(user)
  }),
  getUsers: AsyncErrorHandler(async (req, res) => {
    const users = await User.find().select("-password")
    res.status(200).json(users)
  }),
  updateUser: AsyncErrorHandler(async (req, res) => {
    const {name, avatar, email} = req.body
    await User.findOneAndUpdate(
      {_id: req.user.id},
      //update can be a single item just put one of them in body and send req
      {
        email,
        name,
        avatar,
      }
    )
    res.status(200).json({msg: "Update Success!"})
  }),
  deleteUser: AsyncErrorHandler(async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(
        new ErrorHandler(`No user found with id:${req.params.id}`, 404)
      )
    }
    await User.findByIdAndDelete(req.params.id)
    res.status(200).json({msg: "Deleted Success!"})
  }),
}

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESHTOKEN)
}

module.exports = userCtrl
