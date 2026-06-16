const express = require("express");
const { findCategoryById } = require("../repositories/categoriesRepository");
const {
  createSuggestion,
  deleteSuggestion,
  findAllSuggestions,
  findSuggestionById,
  findSuggestionRecordById,
  updateSuggestion
} = require("../repositories/suggestionsRepository");
const { toggleLike } = require("../repositories/likesRepository");
const { createHttpError } = require("../utils/httpError");
const { verifyMasterPassword } = require("../utils/masterPassword");
const { verifyPassword } = require("../utils/password");
const { validatePassword, validateSuggestionPayload } = require("../utils/validators");

const router = express.Router();

function requireSuggestion(req, res, next) {
  const suggestion = findSuggestionById(req.params.id);
  const suggestionRecord = findSuggestionRecordById(req.params.id);

  if (!suggestion) {
    return next(createHttpError(404, "건의사항을 찾을 수 없습니다."));
  }

  req.suggestion = suggestion;
  req.suggestionRecord = suggestionRecord;
  return next();
}

function validateCategory(categoryId) {
  return Boolean(findCategoryById(categoryId));
}

function validateEditPasswords(req, next) {
  const body = req.body || {};
  const password = typeof body.password === "string" ? body.password.trim() : "";
  const masterPassword = typeof body.master_password === "string" ? body.master_password.trim() : "";

  if (!password && !masterPassword) {
    next(createHttpError(400, "글 비밀번호 또는 마스터 비밀번호를 입력해 주세요."));
    return false;
  }

  const ownerPasswordMatches = password && verifyPassword(password, req.suggestionRecord.password_hash);
  const masterPasswordMatches = masterPassword && verifyMasterPassword(masterPassword);

  if (!ownerPasswordMatches && !masterPasswordMatches) {
    next(createHttpError(403, "비밀번호가 일치하지 않습니다."));
    return false;
  }

  return true;
}

router.get("/", (req, res) => {
  const { category_id: categoryId, sort } = req.query;
  res.json(findAllSuggestions({ categoryId, sort }));
});

router.get("/:id", requireSuggestion, (req, res) => {
  res.json(req.suggestion);
});

router.post("/:id/verify-password", requireSuggestion, (req, res, next) => {
  if (!validateEditPasswords(req, next)) return;

  res.json({ message: "비밀번호가 확인되었습니다." });
});

router.post("/", (req, res, next) => {
  const { errors, payload } = validateSuggestionPayload(req.body);
  const { password, error: passwordError } = validatePassword(req.body.password);

  if (passwordError) {
    errors.push(passwordError);
  }

  if (!validateCategory(payload.category_id)) {
    errors.push("존재하지 않는 카테고리입니다.");
  }

  if (errors.length > 0) {
    return next(createHttpError(400, errors.join(" ")));
  }

  payload.password = password;
  const suggestion = createSuggestion(payload);
  return res.status(201).json({
    message: "건의사항이 등록되었습니다.",
    id: suggestion.id
  });
});

router.patch("/:id", requireSuggestion, (req, res, next) => {
  if (!validateEditPasswords(req, next)) return;

  const { errors, payload } = validateSuggestionPayload(req.body, { partial: true });
  const newPassword = typeof req.body.new_password === "string" ? req.body.new_password.trim() : "";

  if (newPassword) {
    const { error: newPasswordError } = validatePassword(newPassword);

    if (newPasswordError) {
      errors.push(newPasswordError);
    }

    payload.new_password = newPassword;
  }

  if (payload.category_id && !validateCategory(payload.category_id)) {
    errors.push("존재하지 않는 카테고리입니다.");
  }

  if (errors.length > 0) {
    return next(createHttpError(400, errors.join(" ")));
  }

  const updatedSuggestion = updateSuggestion(req.params.id, payload);
  return res.json(updatedSuggestion);
});

router.delete("/:id", requireSuggestion, (req, res, next) => {
  if (!validateEditPasswords(req, next)) return;

  deleteSuggestion(req.params.id);
  res.status(204).send();
});

router.post("/:id/likes", requireSuggestion, (req, res, next) => {
  const userName = typeof req.body.user_name === "string" ? req.body.user_name.trim() : "";

  if (userName.length < 2) {
    return next(createHttpError(400, "좋아요를 누른 사용자 이름을 2글자 이상 입력해 주세요."));
  }

  const result = toggleLike(req.params.id, userName);
  return res.status(200).json({
    message: result.liked ? "공감했습니다." : "공감을 취소했습니다.",
    liked: result.liked,
    like_count: result.like_count
  });
});

module.exports = router;
