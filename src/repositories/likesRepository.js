const { nextId, readDatabase, writeDatabase } = require("../db/jsonStore");
const { formatDateTime } = require("../utils/date");

function countLikesBySuggestionId(suggestionId, database = readDatabase()) {
  return database.likes.filter((like) => like.suggestion_id === Number(suggestionId)).length;
}

function findLikeByUser(suggestionId, userName, database = readDatabase()) {
  return database.likes.find((like) => (
    like.suggestion_id === Number(suggestionId) &&
    like.user_name.toLowerCase() === userName.trim().toLowerCase()
  ));
}

function createLike(suggestionId, userName) {
  const database = readDatabase();
  const existingLike = findLikeByUser(suggestionId, userName, database);

  if (existingLike) {
    return { like: existingLike, created: false };
  }

  const like = {
    id: nextId(database.likes),
    suggestion_id: Number(suggestionId),
    user_name: userName.trim(),
    created_at: formatDateTime()
  };

  database.likes.push(like);
  writeDatabase(database);

  return { like, created: true };
}

function toggleLike(suggestionId, userName) {
  const database = readDatabase();
  const existingLike = findLikeByUser(suggestionId, userName, database);

  if (existingLike) {
    database.likes = database.likes.filter((like) => like.id !== existingLike.id);
    writeDatabase(database);

    return {
      liked: false,
      like_count: countLikesBySuggestionId(suggestionId, database)
    };
  }

  const like = {
    id: nextId(database.likes),
    suggestion_id: Number(suggestionId),
    user_name: userName.trim(),
    created_at: formatDateTime()
  };

  database.likes.push(like);
  writeDatabase(database);

  return {
    liked: true,
    like,
    like_count: countLikesBySuggestionId(suggestionId, database)
  };
}

function deleteLike(suggestionId, userName) {
  const database = readDatabase();
  const beforeCount = database.likes.length;

  database.likes = database.likes.filter((like) => !(
    like.suggestion_id === Number(suggestionId) &&
    like.user_name.toLowerCase() === userName.trim().toLowerCase()
  ));

  writeDatabase(database);
  return beforeCount !== database.likes.length;
}

function deleteLikesBySuggestionId(suggestionId, database) {
  database.likes = database.likes.filter((like) => like.suggestion_id !== Number(suggestionId));
}

module.exports = {
  countLikesBySuggestionId,
  createLike,
  deleteLike,
  deleteLikesBySuggestionId,
  toggleLike
};
