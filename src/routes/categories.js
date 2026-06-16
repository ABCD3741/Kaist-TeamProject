const express = require("express");
const { findAllCategories } = require("../repositories/categoriesRepository");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(findAllCategories());
});

module.exports = router;
