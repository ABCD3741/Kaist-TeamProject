const express = require("express");
const path = require("path");
const categoriesRouter = require("./routes/categories");
const suggestionsRouter = require("./routes/suggestions");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

function createApp() {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.use("/api/categories", categoriesRouter);
  app.use("/api/suggestions", suggestionsRouter);

  app.use("/api", notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
