const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed");
const {list,read,create,update} = require("./dishes.controller")

router.route("/").get(list).post(create).all(methodNotAllowed);
router.route("/:dishId").get(read).put(update).all(methodNotAllowed);

module.exports = router;
