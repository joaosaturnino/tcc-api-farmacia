const express = require("express");
const router = express.Router();

// const routes_guilherme = require("./routes-guilherme");
const routes_jh = require("./routes-jh");
// const routes_jr = require("./routes-jr");
// const routes_emily = require("./routes-emily");

// router.use("/", routes_guilherme);
router.use("/", routes_jh);
// router.use("/", routes_jr);
// router.use("/", routes_emily);

module.exports = router;
