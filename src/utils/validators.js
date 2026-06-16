const VALID_STATUSES = ["접수", "검토중", "처리완료"];

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateSuggestionPayload(body, { partial = false } = {}) {
  const title = cleanText(body.title);
  const content = cleanText(body.content);
  const writerName = cleanText(body.writer_name);
  const categoryId = Number(body.category_id);
  const status = cleanText(body.status);
  const errors = [];
  const payload = {};

  if (!partial || body.title !== undefined) {
    if (title.length < 2) errors.push("제목은 2글자 이상 입력해 주세요.");
    payload.title = title;
  }

  if (!partial || body.content !== undefined) {
    if (content.length < 5) errors.push("내용은 5글자 이상 입력해 주세요.");
    payload.content = content;
  }

  if (!partial || body.category_id !== undefined) {
    if (!Number.isInteger(categoryId) || categoryId < 1) {
      errors.push("카테고리를 선택해 주세요.");
    }
    payload.category_id = categoryId;
  }

  if (!partial || body.writer_name !== undefined) {
    if (writerName.length < 2) errors.push("작성자 이름은 2글자 이상 입력해 주세요.");
    payload.writer_name = writerName;
  }

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      errors.push("처리 상태 값이 올바르지 않습니다.");
    }
    payload.status = status;
  }

  return { errors, payload };
}

function validatePassword(value) {
  const password = cleanText(value);

  return {
    password,
    error: password.length < 4 ? "비밀번호는 4글자 이상 입력해 주세요." : null
  };
}

function validateMasterPassword(value) {
  const masterPassword = cleanText(value);

  return {
    masterPassword,
    error: masterPassword.length === 0 ? "마스터 비밀번호를 입력해 주세요." : null
  };
}

module.exports = {
  VALID_STATUSES,
  validateMasterPassword,
  validatePassword,
  validateSuggestionPayload
};
