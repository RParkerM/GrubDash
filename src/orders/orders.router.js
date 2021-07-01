const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed");
const { list, read, create, update, destroy } = require("./orders.controller");

router.route("/").get(list).post(create).all(methodNotAllowed);
router
  .route("/:orderId")
  .get(read)
  .put(update)
  .delete(destroy)
  .all(methodNotAllowed);

module.exports = router;
