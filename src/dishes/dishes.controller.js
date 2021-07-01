const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

const checkIfDishExists = (req, res, next) => {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    next();
  } else {
    next({ status: 404, message: `No dish found with id: ${dishId}.` });
  }
};

const list = (req, res, next) => {
  res.json({ data: dishes });
};

const read = (req, res, next) => {
  res.json({ data: res.locals.dish });
};

const hasValidProperties = (req, res, next) => {
  const {
    data: { name, description, price, image_url },
  } = req.body;
  const errors = [];

  if (typeof name !== "string" || name.length < 1)
    errors.push("Dishes require a name.");
  if (typeof description !== "string" || description.length < 1)
    errors.push("Dishes require a description.");
  if (typeof price != "number" || isNaN(price)) {
    errors.push("Dishes require a price.");
  } else if (price <= 0) {
    errors.push("Dish price must be greater than zero.");
  }
  if (typeof image_url !== "string" || image_url.length < 1)
    errors.push("Dishes requirea valid image_url.");
  if (errors.length > 0) {
    next({ status: 400, message: errors.join(" ") });
  } else {
    next();
  }
};

const create = (req, res, next) => {
  const {
    data: { name, description, price, image_url },
  } = req.body;
  const newDish = { id: nextId(), name, description, price, image_url };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
};

const update = (req, res, next) => {
  const {
    data: { name, description, price, image_url, id },
  } = req.body;
  if (id && id !== res.locals.dish.id) {
    next({
      status: 400,
      message: `Object with id ${id} does not match :dishId`,
    });
  } else {
    const newDish = {
      id: res.locals.dish.id,
      name,
      description,
      price,
      image_url,
    };
    dishes[dishes.indexOf(res.locals.dish)] = newDish;
    res.json({ data: newDish });
  }
};

module.exports = {
  read: [checkIfDishExists, read],
  create: [hasValidProperties, create],
  update: [checkIfDishExists, hasValidProperties, update],
  list,
};
