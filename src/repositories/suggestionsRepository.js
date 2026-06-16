const { nextId, readDatabase, writeDatabase } = require("../db/jsonStore");
const { formatDateTime } = require("../utils/date");
const { hashPassword } = require("../utils/password");
const { countLikesBySuggestionId, deleteLikesBySuggestionId } = require("./likesRepository");

function toSuggestionResponse(suggestion, database) {
  const category = database.categories.find((item) => item.id === suggestion.category_id);
  const { password_hash: passwordHash, ...publicSuggestion } = suggestion;

  return {
    ...publicSuggestion,
    category: category ? category.name : "미분류",
    like_count: countLikesBySuggestionId(suggestion.id, database)
  };
}

function findAllSuggestions({ categoryId, sort = "latest" } = {}) {
  const database = readDatabase();
  let suggestions = database.suggestions.map((suggestion) => toSuggestionResponse(suggestion, database));

  if (categoryId) {
    suggestions = suggestions.filter((suggestion) => suggestion.category_id === Number(categoryId));
  }

  return suggestions.sort((left, right) => {
    if (sort === "likes") {
      return right.like_count - left.like_count || new Date(right.created_at) - new Date(left.created_at);
    }
    return new Date(right.created_at) - new Date(left.created_at);
  });
}

function findSuggestionById(id) {
  const database = readDatabase();
  const suggestion = database.suggestions.find((item) => item.id === Number(id));
  return suggestion ? toSuggestionResponse(suggestion, database) : null;
}

function findSuggestionRecordById(id) {
  const database = readDatabase();
  return database.suggestions.find((item) => item.id === Number(id)) || null;
}

function createSuggestion(payload) {
  const database = readDatabase();
  const suggestion = {
    id: nextId(database.suggestions),
    title: payload.title,
    content: payload.content,
    category_id: payload.category_id,
    writer_name: payload.writer_name,
    password_hash: hashPassword(payload.password),
    status: "접수",
    created_at: formatDateTime()
  };

  database.suggestions.push(suggestion);
  writeDatabase(database);

  return suggestion;
}

function updateSuggestion(id, payload) {
  const database = readDatabase();
  const suggestion = database.suggestions.find((item) => item.id === Number(id));

  if (!suggestion) {
    return null;
  }

  const { new_password: newPassword, ...nextPayload } = payload;

  Object.assign(suggestion, nextPayload);

  if (newPassword) {
    suggestion.password_hash = hashPassword(newPassword);
  }

  writeDatabase(database);

  return toSuggestionResponse(suggestion, database);
}

function deleteSuggestion(id) {
  const database = readDatabase();
  const beforeCount = database.suggestions.length;

  database.suggestions = database.suggestions.filter((suggestion) => suggestion.id !== Number(id));
  deleteLikesBySuggestionId(id, database);
  writeDatabase(database);

  return beforeCount !== database.suggestions.length;
}

module.exports = {
  createSuggestion,
  deleteSuggestion,
  findAllSuggestions,
  findSuggestionById,
  findSuggestionRecordById,
  updateSuggestion
};
