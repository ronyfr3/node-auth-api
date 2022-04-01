const router = require("express").Router()
const userCtrl = require("../controllers/auth")
const {protect, admin} = require("../middleware/auth")

router.post("/register", userCtrl.register)
router.post("/login", userCtrl.login)
router.post("/forgot", protect, userCtrl.resetPassword)
router.get("/user-info/:id", protect, admin, userCtrl.getUser)
router.get("/all-users", protect, admin, userCtrl.getUsers)
router.patch("/update_user", protect, userCtrl.updateUser)
router.delete("/delete-user/:id", protect, admin, userCtrl.deleteUser)

module.exports = router
