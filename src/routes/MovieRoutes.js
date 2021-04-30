const express = require("express");
const router = express.Router();
const { MovieController } = require("./../controllers");
const { verifyTokenAccess } = require("./../helpers/VerifyToken");

const {
  getAll,
  getQuery,
  addMovie,
  changeStatus,
  addSchedule,
} = MovieController;

router.get("/get/all", getAll);
router.get("/get", getQuery);
router.post("/add", verifyTokenAccess, addMovie);
router.patch("/edit/:id", verifyTokenAccess, changeStatus);
router.patch("/set/:id", verifyTokenAccess, addSchedule);

module.exports = router;
