const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

const checkIfOrderExists = (req, res, next) => {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    next();
  } else {
    next({ status: 404, message: `No order found with id: ${orderId}.` });
  }
};

const list = (req, res, next) => {
  res.json({ data: orders });
};

const read = (req, res, next) => {
  res.json({ data: res.locals.order });
};

const hasValidProperties = (req, res, next) => {
  const {
    data: { deliverTo, mobileNumber, dishes },
  } = req.body;
  const errors = [];
  if (!deliverTo) errors.push("Order must include a deliverTo.");
  if (!mobileNumber) errors.push("Order must include a mobileNumber.");
  if (!dishes) errors.push("Orders must include a dish.");
  if (!Array.isArray(dishes) || dishes.length < 1) {
    errors.push("Orders must include at least one dish.");
  } else {
    dishes.forEach((dish, index) => {
      if (typeof dish.quantity !== "number" || dish.quantity <= 0)
        errors.push(
          `Dish ${index} must have a quantity that is an integer greater than 0.`
        );
    });
  }

  if (errors.length > 0) {
    next({ status: 400, message: errors.join(" ") });
  } else {
    next();
  }
};

const create = (req, res, next) => {
  const {
    data: { deliverTo, mobileNumber, dishes },
  } = req.body;
  const newOrder = { id: nextId(), deliverTo, mobileNumber, dishes };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
};

const update = (req, res, next) => {
  const {
    data: { deliverTo, mobileNumber, dishes, id, status },
  } = req.body;
  if (id && id !== res.locals.order.id) {
    next({
      status: 400,
      message: `Object with id ${id} does not match :orderId`,
    });
  } else if (
    !status ||
    !["pending", "preparing", "out-for-delivery", "delivered"].includes(status)
  ) {
    next({
      status: 400,
      message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
    });
  } else if (res.locals.order.status === "delivered") {
    next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  } else {
    const newOrder = {
      id: res.locals.order.id,
      deliverTo,
      mobileNumber,
      dishes,
      status,
    };
    orders[orders.indexOf(res.locals.order)] = newOrder;
    res.json({ data: newOrder });
  }
};

const destroy = (req, res, next) => {
  if (res.locals.order.status !== "pending") {
    next({
      status: 400,
      message: "An order cannot be deleted unless it is pending.",
    });
  } else {
    orders.splice(orders.indexOf(res.locals.order), 1);
    res.status(204).json({ data: [] });
  }
};

module.exports = {
  read: [checkIfOrderExists, read],
  create: [hasValidProperties, create],
  update: [checkIfOrderExists, hasValidProperties, update],
  destroy: [checkIfOrderExists, destroy],
  list,
};
