const state = {
  categories: [],
  suggestions: [],
  selectedId: null,
  sort: "latest",
  categoryId: "",
  editAccessPassword: ""
};

const elements = {
  categoryFilter: document.querySelector("#categoryFilter"),
  categoryInput: document.querySelector("#categoryInput"),
  closeDialogButton: document.querySelector("#closeDialogButton"),
  cancelDialogButton: document.querySelector("#cancelDialogButton"),
  contentInput: document.querySelector("#contentInput"),
  deleteButton: document.querySelector("#deleteButton"),
  detailCategory: document.querySelector("#detailCategory"),
  detailContent: document.querySelector("#detailContent"),
  detailCreatedAt: document.querySelector("#detailCreatedAt"),
  detailLikeCount: document.querySelector("#detailLikeCount"),
  detailMessage: document.querySelector("#detailMessage"),
  detailTitle: document.querySelector("#detailTitle"),
  detailView: document.querySelector("#detailView"),
  detailWriter: document.querySelector("#detailWriter"),
  dialog: document.querySelector("#suggestionDialog"),
  dialogTitle: document.querySelector("#dialogTitle"),
  editButton: document.querySelector("#editButton"),
  emptyDetail: document.querySelector("#emptyDetail"),
  form: document.querySelector("#suggestionForm"),
  formError: document.querySelector("#formError"),
  likeButton: document.querySelector("#likeButton"),
  likeUserName: document.querySelector("#likeUserName"),
  newSuggestionButton: document.querySelector("#newSuggestionButton"),
  refreshButton: document.querySelector("#refreshButton"),
  stateMessage: document.querySelector("#stateMessage"),
  statusSelect: document.querySelector("#statusSelect"),
  suggestionId: document.querySelector("#suggestionId"),
  suggestionList: document.querySelector("#suggestionList"),
  passwordField: document.querySelector("#passwordField"),
  passwordInput: document.querySelector("#passwordInput"),
  passwordLabel: document.querySelector("#passwordLabel"),
  titleInput: document.querySelector("#titleInput"),
  totalCount: document.querySelector("#totalCount"),
  writerInput: document.querySelector("#writerInput")
};

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "요청을 처리하지 못했습니다.");
  }

  return data;
}

function statusClass(status) {
  if (status === "처리완료") return "done";
  if (status === "검토중") return "review";
  return "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function showDetailMessage(message, type = "success") {
  elements.detailMessage.hidden = false;
  elements.detailMessage.textContent = message;
  elements.detailMessage.dataset.type = type;
}

function clearDetailMessage() {
  elements.detailMessage.hidden = true;
  elements.detailMessage.textContent = "";
  elements.detailMessage.dataset.type = "";
}

function renderCategoryOptions() {
  const filterOptions = [
    '<option value="">전체</option>',
    ...state.categories.map((category) => (
      `<option value="${category.id}">${category.name}</option>`
    ))
  ].join("");

  const inputOptions = state.categories.map((category) => (
    `<option value="${category.id}">${category.name}</option>`
  )).join("");

  elements.categoryFilter.innerHTML = filterOptions;
  elements.categoryInput.innerHTML = inputOptions;
}

function renderList() {
  elements.totalCount.textContent = `${state.suggestions.length}건`;

  if (state.suggestions.length === 0) {
    elements.suggestionList.innerHTML = "";
    elements.stateMessage.hidden = false;
    elements.stateMessage.textContent = "등록된 건의사항이 없습니다.";
    return;
  }

  elements.stateMessage.hidden = true;
  elements.suggestionList.innerHTML = state.suggestions.map((suggestion) => `
    <li>
      <button class="suggestion-card ${suggestion.id === state.selectedId ? "active" : ""}" data-id="${suggestion.id}" type="button">
        <div class="card-topline">
          <span class="badge">${escapeHtml(suggestion.category)}</span>
          <span class="status-pill ${statusClass(suggestion.status)}">${escapeHtml(suggestion.status)}</span>
        </div>
        <h3>${escapeHtml(suggestion.title)}</h3>
        <p>${escapeHtml(suggestion.content)}</p>
        <div class="card-footer">
          <span>${escapeHtml(suggestion.writer_name)} · ${escapeHtml(suggestion.created_at)}</span>
          <span class="like-count"><i data-lucide="thumbs-up" aria-hidden="true"></i>${suggestion.like_count}</span>
        </div>
      </button>
    </li>
  `).join("");

  document.querySelectorAll(".suggestion-card").forEach((card) => {
    card.addEventListener("click", () => selectSuggestion(Number(card.dataset.id)));
  });
  renderIcons();
}

function clearDetail() {
  elements.emptyDetail.hidden = false;
  elements.detailView.hidden = true;
}

function renderDetail(suggestion) {
  if (!suggestion) {
    clearDetail();
    return;
  }

  elements.emptyDetail.hidden = true;
  elements.detailView.hidden = false;
  elements.detailCategory.textContent = suggestion.category;
  elements.detailTitle.textContent = suggestion.title;
  elements.detailContent.textContent = suggestion.content;
  elements.detailWriter.textContent = suggestion.writer_name;
  elements.detailCreatedAt.textContent = suggestion.created_at;
  elements.detailLikeCount.textContent = `${suggestion.like_count}명`;
  elements.statusSelect.value = suggestion.status;
  clearDetailMessage();
  renderIcons();
}

async function loadCategories() {
  state.categories = await request("/api/categories");
  renderCategoryOptions();
}

async function loadSuggestions() {
  elements.stateMessage.hidden = false;
  elements.stateMessage.textContent = "건의사항을 불러오는 중입니다.";

  const params = new URLSearchParams();
  params.set("sort", state.sort);
  if (state.categoryId) params.set("category_id", state.categoryId);

  state.suggestions = await request(`/api/suggestions?${params.toString()}`);
  renderList();

  const selected = state.suggestions.find((suggestion) => suggestion.id === state.selectedId);
  renderDetail(selected || null);
}

async function selectSuggestion(id) {
  state.selectedId = id;
  const suggestion = await request(`/api/suggestions/${id}`);
  renderList();
  renderDetail(suggestion);
}

function openDialog(suggestion = null, accessPassword = "") {
  elements.formError.hidden = true;
  elements.formError.textContent = "";

  if (suggestion) {
    state.editAccessPassword = accessPassword;
    elements.dialogTitle.textContent = "건의 수정";
    elements.suggestionId.value = suggestion.id;
    elements.titleInput.value = suggestion.title;
    elements.categoryInput.value = suggestion.category_id;
    elements.writerInput.value = suggestion.writer_name;
    elements.contentInput.value = suggestion.content;
    elements.passwordInput.value = "";
    elements.passwordInput.required = false;
    elements.passwordLabel.textContent = "새 비밀번호";
    elements.passwordInput.placeholder = "바꾸지 않으려면 비워두기";
    elements.passwordField.hidden = false;
  } else {
    state.editAccessPassword = "";
    elements.dialogTitle.textContent = "건의 작성";
    elements.form.reset();
    elements.suggestionId.value = "";
    elements.passwordField.hidden = false;
    elements.passwordInput.required = true;
    elements.passwordLabel.textContent = "비밀번호";
    elements.passwordInput.placeholder = "";
    elements.passwordInput.autocomplete = "new-password";
  }

  elements.dialog.showModal();
}

function closeDialog() {
  state.editAccessPassword = "";
  elements.dialog.close();
}

function askAccessPassword(actionText) {
  return window.prompt(`${actionText}하려면 글 비밀번호 또는 마스터 비밀번호를 입력해 주세요.`);
}

async function saveSuggestion(event) {
  event.preventDefault();

  const id = elements.suggestionId.value;
  const payload = {
    title: elements.titleInput.value,
    category_id: Number(elements.categoryInput.value),
    writer_name: elements.writerInput.value,
    content: elements.contentInput.value
  };

  try {
    if (id) {
      const nextPassword = elements.passwordInput.value.trim();
      await request(`/api/suggestions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...payload,
          password: state.editAccessPassword,
          master_password: state.editAccessPassword,
          ...(nextPassword ? { new_password: nextPassword } : {})
        })
      });
      state.selectedId = Number(id);
    } else {
      const result = await request("/api/suggestions", {
        method: "POST",
        body: JSON.stringify({ ...payload, password: elements.passwordInput.value })
      });
      state.selectedId = result.id;
    }

    closeDialog();
    state.editAccessPassword = "";
    await loadSuggestions();
    await selectSuggestion(state.selectedId);
  } catch (error) {
    elements.formError.hidden = false;
    elements.formError.textContent = error.message;
  }
}

async function startEditingSelectedSuggestion() {
  const suggestion = state.suggestions.find((item) => item.id === state.selectedId);
  if (!suggestion) return;

  const accessPassword = askAccessPassword("수정");
  if (!accessPassword) return;

  try {
    await request(`/api/suggestions/${suggestion.id}/verify-password`, {
      method: "POST",
      body: JSON.stringify({
        password: accessPassword,
        master_password: accessPassword
      })
    });
    openDialog(suggestion, accessPassword);
  } catch (error) {
    showDetailMessage(error.message, "error");
  }
}

async function updateStatus() {
  if (!state.selectedId) return;

  const accessPassword = askAccessPassword("처리 상태 변경");
  if (!accessPassword) {
    const suggestion = state.suggestions.find((item) => item.id === state.selectedId);
    if (suggestion) elements.statusSelect.value = suggestion.status;
    return;
  }

  try {
    await request(`/api/suggestions/${state.selectedId}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: elements.statusSelect.value,
        password: accessPassword,
        master_password: accessPassword
      })
    });

    await loadSuggestions();
    await selectSuggestion(state.selectedId);
  } catch (error) {
    const suggestion = state.suggestions.find((item) => item.id === state.selectedId);
    if (suggestion) elements.statusSelect.value = suggestion.status;
    showDetailMessage(error.message, "error");
  }
}

async function deleteSelectedSuggestion() {
  if (!state.selectedId) return;

  const confirmed = window.confirm("선택한 건의사항을 삭제할까요?");
  if (!confirmed) return;

  const accessPassword = askAccessPassword("삭제");
  if (!accessPassword) return;

  try {
    await request(`/api/suggestions/${state.selectedId}`, {
      method: "DELETE",
      body: JSON.stringify({
        password: accessPassword,
        master_password: accessPassword
      })
    });
    state.selectedId = null;
    await loadSuggestions();
  } catch (error) {
    showDetailMessage(error.message, "error");
  }
}

async function likeSelectedSuggestion() {
  if (!state.selectedId) return;

  try {
    const result = await request(`/api/suggestions/${state.selectedId}/likes`, {
      method: "POST",
      body: JSON.stringify({ user_name: elements.likeUserName.value })
    });

    await loadSuggestions();
    await selectSuggestion(state.selectedId);
    showDetailMessage(result.message);
  } catch (error) {
    showDetailMessage(error.message, "error");
  }
}

function bindEvents() {
  elements.newSuggestionButton.addEventListener("click", () => openDialog());
  elements.closeDialogButton.addEventListener("click", closeDialog);
  elements.cancelDialogButton.addEventListener("click", closeDialog);
  elements.form.addEventListener("submit", saveSuggestion);
  elements.refreshButton.addEventListener("click", loadSuggestions);
  elements.categoryFilter.addEventListener("change", (event) => {
    state.categoryId = event.target.value;
    loadSuggestions();
  });
  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".segment").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      state.sort = button.dataset.sort;
      loadSuggestions();
    });
  });
  elements.statusSelect.addEventListener("change", updateStatus);
  elements.editButton.addEventListener("click", () => {
    startEditingSelectedSuggestion();
  });
  elements.deleteButton.addEventListener("click", deleteSelectedSuggestion);
  elements.likeButton.addEventListener("click", likeSelectedSuggestion);
}

async function boot() {
  bindEvents();
  renderIcons();

  try {
    await loadCategories();
    await loadSuggestions();
    if (state.suggestions[0]) {
      await selectSuggestion(state.suggestions[0].id);
    }
  } catch (error) {
    elements.stateMessage.hidden = false;
    elements.stateMessage.textContent = error.message;
  }
}

boot();
