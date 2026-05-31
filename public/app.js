const state = {
  fields: [],
  selectedFields: new Set(),
  topics: [],
  selectedTopics: new Set(),
  papers: [],
  classics: [],
  saved: [],
  news: [],
  newsCategory: "all",
  trends: [],
  view: "latest",
  rankingMode: "significant",
  requestId: 0,
  status: "loading"
};

const fieldList = document.querySelector("#fieldList");
const fieldTemplate = document.querySelector("#fieldTemplate");
const topicList = document.querySelector("#topicList");
const topicTemplate = document.querySelector("#topicTemplate");
const paperTemplate = document.querySelector("#paperTemplate");
const paperList = document.querySelector("#paperList");
const trendMap = document.querySelector("#trendMap");
const refreshButton = document.querySelector("#refreshButton");
const dayWindow = document.querySelector("#dayWindow");
const sourceStatus = document.querySelector("#sourceStatus");
const paperCount = document.querySelector("#paperCount");
const trendCount = document.querySelector("#trendCount");
const newsCount = document.querySelector("#newsCount");
const updatedAt = document.querySelector("#updatedAt");
const newsUpdatedAt = document.querySelector("#newsUpdatedAt");
const newsRefreshButton = document.querySelector("#newsRefreshButton");
const newsList = document.querySelector("#newsList");
const newsTemplate = document.querySelector("#newsTemplate");
const featuredPapers = document.querySelector("#featuredPapers");
const featuredPaperTemplate = document.querySelector("#featuredPaperTemplate");
const featuredNews = document.querySelector("#featuredNews");
const featuredNewsTemplate = document.querySelector("#featuredNewsTemplate");
const featuredNewsScope = document.querySelector("#featuredNewsScope");
const seeMorePapersButton = document.querySelector("#seeMorePapersButton");
const seeMoreNewsButton = document.querySelector("#seeMoreNewsButton");
const allTrendNews = document.querySelector("#allTrendNews");
const allPapers = document.querySelector("#allPapers");
const searchInput = document.querySelector("#searchInput");
const fieldForm = document.querySelector("#fieldForm");
const topicForm = document.querySelector("#topicForm");
const paperViewTitle = document.querySelector("#paperViewTitle");
const paperViewSubtitle = document.querySelector("#paperViewSubtitle");
const activeTopicsLabel = document.querySelector("#activeTopicsLabel");

if (window.matchMedia("(max-width: 900px)").matches) {
  document.querySelectorAll(".sidebar-panel").forEach((panel) => panel.removeAttribute("open"));
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "content-type": "application/json" },
    ...options
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

function formatDate(value) {
  if (!value) return "unknown date";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value)
  );
}

function renderTopics() {
  topicList.replaceChildren();
  if (!state.topics.length) {
    topicList.innerHTML = '<div class="empty-topics">No interests yet. Add a topic below.</div>';
    renderActiveTopicsLabel();
    return;
  }
  for (const topic of state.topics) {
    const node = topicTemplate.content.cloneNode(true);
    const input = node.querySelector("input");
    input.checked = state.selectedTopics.has(topic.id);
    input.addEventListener("change", () => {
      if (input.checked) state.selectedTopics.add(topic.id);
      else state.selectedTopics.delete(topic.id);
      renderActiveTopicsLabel();
      loadDiscovery();
    });
    node.querySelector(".swatch").style.background = topic.color;
    node.querySelector(".topic-name").textContent = topic.name;
    const removeButton = node.querySelector(".topic-remove");
    removeButton.setAttribute("aria-label", `Remove ${topic.name}`);
    removeButton.title = `Remove ${topic.name}`;
    removeButton.addEventListener("click", async () => {
      await api(`/api/topics/${encodeURIComponent(topic.id)}`, { method: "DELETE" });
      state.topics = state.topics.filter((item) => item.id !== topic.id);
      state.selectedTopics.delete(topic.id);
      renderTopics();
      await loadDiscovery();
    });
    topicList.append(node);
  }
  renderActiveTopicsLabel();
}

function renderFields() {
  fieldList.replaceChildren();
  if (!state.fields.length) {
    fieldList.innerHTML = '<div class="empty-topics">No field lenses yet. Add a field below.</div>';
    renderActiveTopicsLabel();
    return;
  }
  for (const field of state.fields) {
    const node = fieldTemplate.content.cloneNode(true);
    const input = node.querySelector("input");
    input.checked = state.selectedFields.has(field.id);
    input.addEventListener("change", () => {
      if (input.checked) state.selectedFields.add(field.id);
      else state.selectedFields.delete(field.id);
      renderActiveTopicsLabel();
      loadDiscovery();
    });
    node.querySelector(".swatch").style.background = field.color;
    node.querySelector(".topic-name").textContent = field.name;
    const removeButton = node.querySelector(".topic-remove");
    removeButton.setAttribute("aria-label", `Remove ${field.name}`);
    removeButton.title = `Remove ${field.name}`;
    removeButton.addEventListener("click", async () => {
      await api(`/api/fields/${encodeURIComponent(field.id)}`, { method: "DELETE" });
      state.fields = state.fields.filter((item) => item.id !== field.id);
      state.selectedFields.delete(field.id);
      renderFields();
      await loadDiscovery();
    });
    fieldList.append(node);
  }
  renderActiveTopicsLabel();
}

function renderActiveTopicsLabel() {
  const activeNames = state.topics
    .filter((topic) => state.selectedTopics.has(topic.id))
    .map((topic) => topic.name);
  const fieldNames = state.fields
    .filter((field) => state.selectedFields.has(field.id))
    .map((field) => field.name);
  const fieldSuffix = fieldNames.length ? ` · Fields: ${fieldNames.join(" · ")}` : "";
  activeTopicsLabel.textContent = activeNames.length
    ? `Tracking: ${activeNames.join(" · ")}${fieldSuffix}`
    : `Select at least one interest to track${fieldSuffix}`;
}

function renderTrends() {
  trendMap.replaceChildren();
  if (!state.trends.length) {
    trendMap.innerHTML = '<div class="empty-state">No trend signals yet.</div>';
    return;
  }
  for (const trend of state.trends) {
    const token = document.createElement("div");
    token.className = "trend-token";
    token.innerHTML = `<strong></strong><span></span>`;
    token.querySelector("strong").textContent = trend.name;
    token.querySelector("span").textContent = trend.weight;
    trendMap.append(token);
  }
}

function renderNews() {
  newsList.replaceChildren();
  const items = state.newsCategory === "all"
    ? state.news
    : state.news.filter((item) => item.category === state.newsCategory);
  if (!items.length) {
    newsList.innerHTML = '<div class="empty-state">No news signals match this category.</div>';
    return;
  }
  for (const item of items) {
    const node = newsTemplate.content.cloneNode(true);
    node.querySelector(".news-category").textContent = item.category;
    const link = node.querySelector("a");
    link.href = item.url;
    link.textContent = item.title;
    node.querySelector("span").textContent = [item.source, formatDate(item.publishedAt)].filter(Boolean).join(" · ");
    newsList.append(node);
  }
}

function renderFeaturedPapers() {
  featuredPapers.replaceChildren();
  const papers = activePapers().slice(0, 3);
  if (!papers.length) {
    featuredPapers.innerHTML = `<div class="empty-state">No papers match the ${state.view} view.</div>`;
    return;
  }
  for (const paper of papers) {
    const node = featuredPaperTemplate.content.cloneNode(true);
    node.querySelector(".featured-score strong").textContent = paper.score || 0;
    const link = node.querySelector("a");
    link.href = paper.url || paper.doi || "#";
    link.textContent = paper.title;
    node.querySelector("p").textContent = [
      paper.venue,
      formatDate(paper.publicationDate),
      `${paper.citedByCount || 0} citations`
    ].join(" · ");
    node.querySelector(".featured-signal").textContent = (paper.signals || []).slice(0, 2).join(" · ");
    featuredPapers.append(node);
  }
}

function headlineNews() {
  const selected = [];
  for (const category of ["academia", "industry"]) {
    const item = state.news.find((entry) => entry.category === category);
    if (item) selected.push(item);
  }
  for (const item of state.news) {
    if (!selected.some((entry) => entry.id === item.id)) selected.push(item);
    if (selected.length === 3) break;
  }
  return selected.slice(0, 3);
}

function renderFeaturedNews() {
  featuredNews.replaceChildren();
  const items = headlineNews();
  if (!items.length) {
    featuredNews.innerHTML = '<div class="empty-state">No news signals available today.</div>';
    return;
  }
  for (const item of items) {
    const node = featuredNewsTemplate.content.cloneNode(true);
    node.querySelector(".news-category").textContent = item.category;
    const link = node.querySelector("a");
    link.href = item.url;
    link.textContent = item.title;
    node.querySelector("span").textContent = `${item.source} · ${formatDate(item.publishedAt)}`;
    featuredNews.append(node);
  }
}

function paperMatchesSearch(paper) {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) return true;
  const text = [
    paper.title,
    paper.abstract,
    paper.venue,
    paper.whyClassic,
    paper.authors?.join(" "),
    paper.topics?.join(" "),
    paper.keywords?.join(" ")
  ]
    .join(" ")
    .toLowerCase();
  return text.includes(query);
}

function activePapers() {
  const collections = {
    latest: state.papers,
    classic: state.classics,
    saved: state.saved
  };
  const papers = collections[state.view] || state.papers;
  return papers.filter(paperMatchesSearch);
}

function selectedTopicParam() {
  return [...state.selectedTopics].join(",");
}

function selectedFieldParam() {
  return [...state.selectedFields].join(",");
}

async function fetchPaperDiscovery(windowValue) {
  const selected = selectedTopicParam();
  const minSignificance = 34;
  const field = selectedFieldParam();
  return api(
    `/api/discover?days=${windowValue}&minSignificance=${minSignificance}&topics=${encodeURIComponent(selected)}&field=${encodeURIComponent(field)}`
  );
}

function setPaperLoading(message = "Loading papers...") {
  paperList.innerHTML = `<div class="empty-state">${message}</div>`;
}

function updatePaperViewCopy() {
  const copy = {
    latest: [
      state.rankingMode === "all-time" ? "Most Significant Papers" : "Significant Latest Papers",
      state.rankingMode === "all-time"
        ? "All-time field-defining papers ranked by influence and relevance, without a publication-date cutoff."
        : state.rankingMode === "best-available"
        ? "Showing the strongest available matches ranked by importance signals."
        : "Recent papers ranked by citation, relevance, venue, and abstract evidence."
    ],
    classic: [
      "Classic / All-Time Papers",
      "Field-defining papers for the selected interests, ranked without a publication-date cutoff."
    ],
    saved: [
      "Saved Papers",
      "Your local reading queue and reference shelf."
    ]
  };
  const [title, subtitle] = copy[state.view] || copy.latest;
  paperViewTitle.textContent = title;
  paperViewSubtitle.textContent = subtitle;
}

function renderPapers() {
  paperList.replaceChildren();
  const papers = activePapers();
  if (!papers.length) {
    paperList.innerHTML = '<div class="empty-state">No papers match this view.</div>';
    return;
  }
  for (const paper of papers) {
    const node = paperTemplate.content.cloneNode(true);
    node.querySelector(".paper-score strong").textContent = paper.score || 0;
    node.querySelector(".paper-score span").textContent = paper.source === "Classic" ? "classic" : "impact";
    node.querySelector(".paper-meta").textContent = [
      paper.source,
      paper.venue,
      formatDate(paper.publicationDate),
      paper.authors?.slice(0, 3).join(", "),
      `${paper.citedByCount || 0} citations`
    ]
      .filter(Boolean)
      .join(" · ");
    node.querySelector("h3").textContent = paper.title;
    node.querySelector(".abstract").textContent = paper.abstract || "No abstract available from the source.";
    const classicNote = node.querySelector(".classic-note");
    if (paper.whyClassic) {
      classicNote.textContent = paper.whyClassic;
    } else {
      classicNote.remove();
    }
    const signalRow = node.querySelector(".signal-row");
    const signals = paper.source === "Classic" ? ["landmark paper"] : paper.signals || [];
    if (signals.length) {
      for (const signal of signals) {
        const chip = document.createElement("span");
        chip.textContent = signal;
        signalRow.append(chip);
      }
    } else {
      signalRow.remove();
    }
    const keywordRow = node.querySelector(".keyword-row");
    for (const keyword of (paper.keywords || []).slice(0, 6)) {
      const chip = document.createElement("span");
      chip.textContent = keyword;
      keywordRow.append(chip);
    }
    const link = node.querySelector("a");
    link.href = paper.url || paper.doi || "#";
    const saveButton = node.querySelector("button");
    const isSaved = state.saved.some((saved) => saved.id === paper.id);
    saveButton.textContent = isSaved ? "Saved" : "Save";
    saveButton.disabled = isSaved;
    saveButton.addEventListener("click", async () => {
      const saved = await api("/api/saved", { method: "POST", body: JSON.stringify(paper) });
      state.saved = [saved, ...state.saved.filter((item) => item.id !== saved.id)];
      renderPapers();
    });
    paperList.append(node);
  }
}

function renderMetrics(payload) {
  paperCount.textContent = state.papers.length;
  trendCount.textContent = state.trends.length;
  newsCount.textContent = state.news.length;
  sourceStatus.textContent = payload.status === "live" ? (payload.providers || ["OpenAlex"]).join(" + ") : "Sample";
  updatedAt.textContent =
    payload.status === "live"
      ? `Updated ${formatDate(payload.updatedAt)}`
      : `Sample mode: ${payload.message || "live source unavailable"}`;
}

async function loadTopics() {
  state.topics = await api("/api/topics");
  state.selectedTopics = new Set(state.topics.map((topic) => topic.id));
  renderTopics();
}

async function loadFields() {
  state.fields = await api("/api/fields");
  state.selectedFields = new Set(state.fields.map((field) => field.id));
  renderFields();
}

async function loadSaved() {
  state.saved = await api("/api/saved");
}

async function loadClassics(requestId = state.requestId) {
  const payload = await fetchPaperDiscovery("all");
  if (requestId !== state.requestId) return null;
  state.classics = payload.papers;
  return payload;
}

async function loadLatestPapers(requestId = state.requestId) {
  sourceStatus.textContent = "...";
  const payload = await fetchPaperDiscovery(dayWindow.value);
  if (requestId !== state.requestId) return null;
  state.papers = payload.papers;
  state.trends = payload.trends;
  state.rankingMode = payload.rankingMode;
  renderMetrics(payload);
  renderTrends();
  renderFeaturedPapers();
  return payload;
}

async function loadTrendNews(requestId = state.requestId) {
  const selected = selectedTopicParam();
  const field = selectedFieldParam();
  const payload = await api(`/api/trend-news?topics=${encodeURIComponent(selected)}&field=${encodeURIComponent(field)}`);
  if (requestId !== state.requestId) return null;
  state.news = payload.items || [];
  newsCount.textContent = state.news.length;
  const topicLabel = payload.topics?.length ? ` for ${payload.topics.join(", ")}` : "";
  featuredNewsScope.textContent = payload.days === 1 ? "Academia + industry today" : "Academia + industry · 7 days";
  newsUpdatedAt.textContent =
    payload.status === "live"
      ? `${payload.days === 1 ? "Today" : "Last 7 days"}${topicLabel} · updated ${formatDate(payload.updatedAt)}`
      : `Sample mode: ${payload.message || "live news unavailable"}`;
  renderNews();
  renderFeaturedNews();
}

async function loadDiscovery() {
  const requestId = ++state.requestId;
  const [latestResult] = await Promise.all([
    loadLatestPapers(requestId),
    loadClassics(requestId),
    loadTrendNews(requestId)
  ]);
  if (requestId !== state.requestId) return null;
  updatePaperViewCopy();
  renderFeaturedPapers();
  renderPapers();
  return latestResult;
}

async function switchPaperView(view) {
  const requestId = ++state.requestId;
  state.view = view;
  if (view === "latest") {
    dayWindow.value = "30";
  } else if (view === "classic") {
    dayWindow.value = "all";
  }
  updatePaperViewCopy();
  setPaperLoading(`Loading ${view === "classic" ? "classics" : view}...`);
  if (view === "latest") {
    await loadLatestPapers(requestId);
  } else if (view === "classic") {
    await loadClassics(requestId);
  } else if (view === "saved") {
    await loadSaved();
  }
  if (requestId !== state.requestId) return;
  updatePaperViewCopy();
  renderFeaturedPapers();
  renderPapers();
}

async function refreshLatestDefault() {
  state.view = "latest";
  dayWindow.value = "30";
  document.querySelectorAll(".segmented button").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === "latest");
  });
  await loadDiscovery();
}

topicForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(topicForm);
  const topic = await api("/api/topics", {
    method: "POST",
    body: JSON.stringify({
      name: form.get("name"),
      query: form.get("query")
    })
  });
  state.topics = [...state.topics.filter((item) => item.id !== topic.id), topic];
  state.selectedTopics.add(topic.id);
  topicForm.reset();
  renderTopics();
  loadDiscovery();
});

fieldForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(fieldForm);
  const field = await api("/api/fields", {
    method: "POST",
    body: JSON.stringify({
      name: form.get("name"),
      query: form.get("query")
    })
  });
  state.fields = [...state.fields.filter((item) => item.id !== field.id), field];
  state.selectedFields.add(field.id);
  fieldForm.reset();
  renderFields();
  loadDiscovery();
});

refreshButton.addEventListener("click", refreshLatestDefault);
dayWindow.addEventListener("change", loadDiscovery);
newsRefreshButton.addEventListener("click", loadTrendNews);
searchInput.addEventListener("input", renderPapers);
seeMorePapersButton.addEventListener("click", () => {
  allPapers.scrollIntoView({ behavior: "smooth", block: "start" });
});
seeMoreNewsButton.addEventListener("click", () => {
  allTrendNews.open = true;
  allTrendNews.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelectorAll(".news-tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".news-tabs button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    state.newsCategory = button.dataset.newsCategory;
    renderNews();
  });
});

document.querySelectorAll(".segmented button").forEach((button) => {
  button.addEventListener("click", async () => {
    document.querySelectorAll(".segmented button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    await switchPaperView(button.dataset.view);
  });
});

await loadFields();
await loadTopics();
await loadSaved();
await loadClassics();
await loadDiscovery();
