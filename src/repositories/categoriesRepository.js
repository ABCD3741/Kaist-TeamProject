const { readDatabase } = require("../db/jsonStore");

function findAllCategories() {
  const database = readDatabase();
  return database.categories
    .slice()
    .sort((left, right) => left.sort_order - right.sort_order);
}

function findCategoryById(id) {
  const database = readDatabase();
  return database.categories.find((category) => category.id === Number(id));
}

module.exports = {
  findAllCategories,
  findCategoryById
};
