const express = require("express");
const router = express.Router();
const { AuthController } = require("./../controllers");
const { verifyTokenAccess } = require("./../helpers/VerifyToken");

const { register, login, deactive, activate, closeAccount } = AuthController;

router.post("/register", register);
router.post("/login", login);
router.patch("/deactive", verifyTokenAccess, deactive);
router.patch("/activate", verifyTokenAccess, activate);
router.patch("/close", verifyTokenAccess, closeAccount);

module.exports = router;
