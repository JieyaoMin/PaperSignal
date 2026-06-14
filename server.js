import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const PORT = Number.parseInt(process.env.PORT || "4173", 10);
const HOST = process.env.HOST || "127.0.0.1";
const ROOT = resolve(".");
const PUBLIC_DIR = join(ROOT, "public");
const DATA_DIR = join(ROOT, "data");
const STORE_FILE = join(DATA_DIR, "store.json");

const seedTopics = [
  {
    id: "ai",
    name: "AI",
    query: "artificial intelligence machine learning foundation models agents",
    color: "#2f6f73"
  },
  {
    id: "data-science",
    name: "Data Science",
    query: "data science statistical learning causal inference data mining",
    color: "#7d5a2f"
  },
  {
    id: "neuroscience",
    name: "Neuroscience",
    query: "neuroscience neural circuits cognitive neuroscience",
    color: "#7a4e8a"
  },
  {
    id: "bci",
    name: "Brain Computer Interface",
    query: "brain computer interface neural decoding EEG ECoG neuroprosthetics",
    color: "#b24b3d"
  },
  {
    id: "computational-neuroscience",
    name: "Computational Neuroscience",
    query: "computational neuroscience neural modeling spiking networks brain dynamics",
    color: "#536fb8"
  }
];

const samplePapers = [
  {
    id: "sample-bci-decoding",
    title: "Foundation Models for Neural Decoding in Brain Computer Interfaces",
    abstract:
      "A survey-style synthesis of emerging neural decoding systems that use large-scale representation learning for speech, motor, and cognitive BCI tasks.",
    year: 2026,
    publicationDate: "2026-05-10",
    venue: "Sample intelligence record",
    citedByCount: 41,
    authors: ["PaperSignal Sample"],
    url: "https://openalex.org/",
    doi: "",
    topics: ["Brain Computer Interface", "AI", "Computational Neuroscience"],
    source: "sample",
    keywords: ["neural decoding", "foundation models", "BCI", "representation learning"]
  },
  {
    id: "sample-neuro-ai",
    title: "Mechanistic Interpretability Meets Computational Neuroscience",
    abstract:
      "Connects circuit analysis in artificial neural networks with hypotheses from sensory coding, neural manifolds, and recurrent brain dynamics.",
    year: 2026,
    publicationDate: "2026-04-22",
    venue: "Sample intelligence record",
    citedByCount: 33,
    authors: ["PaperSignal Sample"],
    url: "https://openalex.org/",
    doi: "",
    topics: ["AI", "Neuroscience", "Computational Neuroscience"],
    source: "sample",
    keywords: ["mechanistic interpretability", "neural manifolds", "circuits", "representation"]
  },
  {
    id: "sample-data-neuro",
    title: "Causal Discovery for High-Dimensional Neural Time Series",
    abstract:
      "Introduces a scalable data science pipeline for causal structure learning across neural population recordings and behavioral readouts.",
    year: 2026,
    publicationDate: "2026-03-18",
    venue: "Sample intelligence record",
    citedByCount: 27,
    authors: ["PaperSignal Sample"],
    url: "https://openalex.org/",
    doi: "",
    topics: ["Data Science", "Neuroscience"],
    source: "sample",
    keywords: ["causal discovery", "time series", "population recordings", "behavior"]
  }
];

const sampleTrendNews = [
  {
    id: "sample-news-academia-1",
    title: "Sample: labs report faster neural decoding progress across speech and motor BCI",
    source: "Sample academia signal",
    category: "academia",
    publishedAt: new Date().toISOString(),
    url: "https://news.google.com/",
    summary: "A placeholder trend item shown when live news sources are unavailable."
  },
  {
    id: "sample-news-industry-1",
    title: "Sample: AI infrastructure companies expand tooling for scientific model evaluation",
    source: "Sample industry signal",
    category: "industry",
    publishedAt: new Date().toISOString(),
    url: "https://news.google.com/",
    summary: "A placeholder trend item shown when live news sources are unavailable."
  },
  {
    id: "sample-news-discussion-1",
    title: "Sample: researchers discuss agents, benchmarks, and reproducibility",
    source: "Sample discussion signal",
    category: "discussion",
    publishedAt: new Date().toISOString(),
    url: "https://hn.algolia.com/",
    summary: "A placeholder trend item shown when live discussion sources are unavailable."
  }
];

const classicPapers = [
  {
    id: "classic-mcculloch-pitts-1943",
    title: "A Logical Calculus of the Ideas Immanent in Nervous Activity",
    abstract:
      "One of the first formal models of neural computation, showing how simplified neurons could implement logical operations.",
    year: 1943,
    publicationDate: "1943-12-01",
    venue: "Bulletin of Mathematical Biophysics",
    citedByCount: 12000,
    authors: ["Warren S. McCulloch", "Walter Pitts"],
    url: "https://doi.org/10.1007/BF02478259",
    doi: "https://doi.org/10.1007/BF02478259",
    topics: ["Neuroscience", "Computational Neuroscience", "AI"],
    source: "Classic",
    keywords: ["neural computation", "logic", "artificial neurons", "foundations"],
    score: 100,
    whyClassic: "It helped define the idea that neural systems could be studied as computational machines."
  },
  {
    id: "classic-hodgkin-huxley-1952",
    title: "A Quantitative Description of Membrane Current and Its Application to Conduction and Excitation in Nerve",
    abstract:
      "The canonical mathematical model of action potential generation in neurons, connecting ion-channel dynamics to excitable membranes.",
    year: 1952,
    publicationDate: "1952-08-28",
    venue: "The Journal of Physiology",
    citedByCount: 18000,
    authors: ["Alan L. Hodgkin", "Andrew F. Huxley"],
    url: "https://doi.org/10.1113/jphysiol.1952.sp004764",
    doi: "https://doi.org/10.1113/jphysiol.1952.sp004764",
    topics: ["Neuroscience", "Computational Neuroscience"],
    source: "Classic",
    keywords: ["action potential", "ion channels", "biophysics", "neuron model"],
    score: 100,
    whyClassic: "It remains a core reference point for computational models of single-neuron dynamics."
  },
  {
    id: "classic-rosenblatt-1958",
    title: "The Perceptron: A Probabilistic Model for Information Storage and Organization in the Brain",
    abstract:
      "Introduced the perceptron as an early learning machine inspired by brain organization and pattern recognition.",
    year: 1958,
    publicationDate: "1958-11-01",
    venue: "Psychological Review",
    citedByCount: 16000,
    authors: ["Frank Rosenblatt"],
    url: "https://doi.org/10.1037/h0042519",
    doi: "https://doi.org/10.1037/h0042519",
    topics: ["AI", "Computational Neuroscience"],
    source: "Classic",
    keywords: ["perceptron", "pattern recognition", "learning machine", "neural networks"],
    score: 99,
    whyClassic: "It made trainable artificial neural networks a concrete research program."
  },
  {
    id: "classic-hubel-wiesel-1962",
    title: "Receptive Fields, Binocular Interaction and Functional Architecture in the Cat's Visual Cortex",
    abstract:
      "Mapped how visual cortex neurons respond to edges, orientation, and binocular input, deeply shaping modern visual neuroscience.",
    year: 1962,
    publicationDate: "1962-01-01",
    venue: "The Journal of Physiology",
    citedByCount: 14000,
    authors: ["David H. Hubel", "Torsten N. Wiesel"],
    url: "https://doi.org/10.1113/jphysiol.1962.sp006837",
    doi: "https://doi.org/10.1113/jphysiol.1962.sp006837",
    topics: ["Neuroscience", "Computational Neuroscience"],
    source: "Classic",
    keywords: ["visual cortex", "receptive fields", "orientation selectivity", "systems neuroscience"],
    score: 98,
    whyClassic: "It gave computational neuroscience a durable language for visual representation."
  },
  {
    id: "classic-vidal-1973",
    title: "Toward Direct Brain-Computer Communication",
    abstract:
      "A foundational proposal for using brain signals as a direct communication channel between humans and computers.",
    year: 1973,
    publicationDate: "1973-01-01",
    venue: "Annual Review of Biophysics and Bioengineering",
    citedByCount: 2500,
    authors: ["Jacques J. Vidal"],
    url: "https://doi.org/10.1146/annurev.bb.02.060173.001105",
    doi: "https://doi.org/10.1146/annurev.bb.02.060173.001105",
    topics: ["Brain Computer Interface", "Neuroscience"],
    source: "Classic",
    keywords: ["BCI", "EEG", "human-computer interaction", "neural signals"],
    score: 96,
    whyClassic: "It is one of the earliest clear formulations of the BCI research agenda."
  },
  {
    id: "classic-hopfield-1982",
    title: "Neural Networks and Physical Systems with Emergent Collective Computational Abilities",
    abstract:
      "Introduced Hopfield networks, connecting recurrent neural computation, energy landscapes, associative memory, and statistical physics.",
    year: 1982,
    publicationDate: "1982-04-01",
    venue: "PNAS",
    citedByCount: 25000,
    authors: ["John J. Hopfield"],
    url: "https://doi.org/10.1073/pnas.79.8.2554",
    doi: "https://doi.org/10.1073/pnas.79.8.2554",
    topics: ["AI", "Computational Neuroscience", "Neuroscience"],
    source: "Classic",
    keywords: ["Hopfield network", "associative memory", "recurrent networks", "energy models"],
    score: 100,
    whyClassic: "It connected neural networks to dynamical systems and memory in a way that still echoes today."
  },
  {
    id: "classic-rumelhart-hinton-williams-1986",
    title: "Learning Representations by Back-Propagating Errors",
    abstract:
      "Popularized backpropagation for training multilayer neural networks, enabling learned internal representations.",
    year: 1986,
    publicationDate: "1986-10-09",
    venue: "Nature",
    citedByCount: 45000,
    authors: ["David E. Rumelhart", "Geoffrey E. Hinton", "Ronald J. Williams"],
    url: "https://doi.org/10.1038/323533a0",
    doi: "https://doi.org/10.1038/323533a0",
    topics: ["AI", "Data Science", "Computational Neuroscience"],
    source: "Classic",
    keywords: ["backpropagation", "deep learning", "representations", "multilayer networks"],
    score: 100,
    whyClassic: "It is the Hinton-linked paper many people point to as the practical revival of deep neural networks."
  },
  {
    id: "classic-lstm-1997",
    title: "Long Short-Term Memory",
    abstract:
      "Introduced LSTM networks for learning long-range dependencies in sequences, influencing language, speech, and time-series modeling.",
    year: 1997,
    publicationDate: "1997-11-01",
    venue: "Neural Computation",
    citedByCount: 70000,
    authors: ["Sepp Hochreiter", "Jurgen Schmidhuber"],
    url: "https://doi.org/10.1162/neco.1997.9.8.1735",
    doi: "https://doi.org/10.1162/neco.1997.9.8.1735",
    topics: ["AI", "Data Science"],
    source: "Classic",
    keywords: ["LSTM", "sequence modeling", "recurrent networks", "memory"],
    score: 99,
    whyClassic: "It became a core architecture for sequence learning before the transformer era."
  },
  {
    id: "classic-lenet-1998",
    title: "Gradient-Based Learning Applied to Document Recognition",
    abstract:
      "A landmark demonstration of convolutional neural networks trained end-to-end for practical document recognition.",
    year: 1998,
    publicationDate: "1998-11-01",
    venue: "Proceedings of the IEEE",
    citedByCount: 60000,
    authors: ["Yann LeCun", "Leon Bottou", "Yoshua Bengio", "Patrick Haffner"],
    url: "https://doi.org/10.1109/5.726791",
    doi: "https://doi.org/10.1109/5.726791",
    topics: ["AI", "Data Science"],
    source: "Classic",
    keywords: ["convolutional networks", "document recognition", "gradient learning", "computer vision"],
    score: 99,
    whyClassic: "It showed that convolutional networks could solve real recognition problems at scale."
  },
  {
    id: "classic-hinton-salakhutdinov-2006",
    title: "Reducing the Dimensionality of Data with Neural Networks",
    abstract:
      "Showed how deep autoencoders could learn compact representations, helping reignite interest in deep learning.",
    year: 2006,
    publicationDate: "2006-07-28",
    venue: "Science",
    citedByCount: 17000,
    authors: ["Geoffrey E. Hinton", "Ruslan R. Salakhutdinov"],
    url: "https://doi.org/10.1126/science.1127647",
    doi: "https://doi.org/10.1126/science.1127647",
    topics: ["AI", "Data Science"],
    source: "Classic",
    keywords: ["deep learning", "autoencoders", "dimensionality reduction", "representation learning"],
    score: 98,
    whyClassic: "It helped mark the modern deep learning revival."
  },
  {
    id: "classic-alexnet-2012",
    title: "ImageNet Classification with Deep Convolutional Neural Networks",
    abstract:
      "Demonstrated a major ImageNet breakthrough using deep convolutional networks, GPUs, dropout, and large-scale supervised learning.",
    year: 2012,
    publicationDate: "2012-12-03",
    venue: "NeurIPS",
    citedByCount: 140000,
    authors: ["Alex Krizhevsky", "Ilya Sutskever", "Geoffrey E. Hinton"],
    url: "https://proceedings.neurips.cc/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html",
    doi: "",
    topics: ["AI", "Data Science"],
    source: "Classic",
    keywords: ["AlexNet", "ImageNet", "convolutional networks", "GPU training"],
    score: 100,
    whyClassic: "It made deep learning impossible for the broader AI field to ignore."
  },
  {
    id: "classic-transformer-2017",
    title: "Attention Is All You Need",
    abstract:
      "Introduced the transformer architecture, replacing recurrence with attention and reshaping modern AI systems.",
    year: 2017,
    publicationDate: "2017-06-12",
    venue: "NeurIPS",
    citedByCount: 150000,
    authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit", "Llion Jones"],
    url: "https://arxiv.org/abs/1706.03762",
    doi: "",
    topics: ["AI", "Data Science"],
    source: "Classic",
    keywords: ["transformers", "attention", "language models", "sequence modeling"],
    score: 100,
    whyClassic: "It is the architectural hinge behind much of current foundation-model research."
  }
];

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

const venueSignals = [
  "nature",
  "science",
  "cell",
  "neuron",
  "pnas",
  "proceedings of the national academy",
  "neurips",
  "iclr",
  "icml",
  "journal of machine learning research",
  "jmlr",
  "nature neuroscience",
  "elife",
  "plos biology",
  "ieee transactions",
  "neural computation"
];

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true });
  if (!existsSync(STORE_FILE)) {
    await writeStore({ fields: [], topics: seedTopics, saved: [], dismissed: [] });
  }
}

async function readStore() {
  await ensureStore();
  const store = JSON.parse(await readFile(STORE_FILE, "utf8"));
  store.fields = store.fields || [];
  return store;
}

async function writeStore(store) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2));
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 1_000_000) throw new Error("Request body too large");
  }
  return body ? JSON.parse(body) : {};
}

function normalizeText(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeXml(value) {
  return normalizeText(value)
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripCdata(value) {
  return String(value || "").replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "");
}

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function slug(value) {
  return normalizeText(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function selectedFields(store, selected) {
  return selected.length ? store.fields.filter((field) => selected.includes(field.id)) : [];
}

function fieldLensFromFields(fields) {
  if (!fields.length) {
    return { id: "all", label: "All fields", query: "", terms: [] };
  }
  const labels = fields.map((field) => field.name);
  const queries = fields.map((field) => expandFieldQuery(field.query || field.name));
  return {
    id: fields.map((field) => field.id).join(","),
    label: labels.join(", "),
    query: queries.join(" "),
    terms: [...labels, ...queries.flatMap((query) => keywordList(query).slice(0, 8))]
  };
}

function queryForField(topic, fieldLens) {
  return [topic.query, fieldLens.query].filter(Boolean).join(" ");
}

function expandFieldQuery(query) {
  const normalized = normalizeText(query);
  const lower = normalized.toLowerCase();
  if (/\bstomotology\b|\bstomatology\b|\bdentistry\b|\bdental\b|\bendodont/.test(lower)) {
    return "dentistry dental endodontics endodontic oral medicine";
  }
  return normalized;
}

function scoreTopicsForField(topicNames, fieldLens) {
  return fieldLens.id === "all" ? topicNames : [...topicNames, fieldLens.label, ...fieldLens.terms];
}

function meaningfulTerms(text) {
  return keywordList(text).filter((term) => term.length > 3);
}

function exactPhrases(text) {
  const normalized = normalizeText(text).toLowerCase();
  const chunks = [normalized];
  if (normalized.includes("root canal")) {
    chunks.push("root canal", "endodontic", "endodontics");
  }
  return [...new Set(chunks.filter((chunk) => chunk.length > 3))];
}

function textMatchesFocus(text, focusText, options = {}) {
  const normalized = normalizeText(text).toLowerCase();
  const phrases = exactPhrases(focusText);
  if (phrases.some((phrase) => normalized.includes(phrase))) {
    return true;
  }
  const terms = meaningfulTerms(focusText);
  if (!terms.length) {
    return true;
  }
  const hits = terms.filter((term) => normalized.includes(term)).length;
  return hits >= Math.min(options.minHits || 2, terms.length);
}

function paperMatchesSelection(paper, topics, fieldLens) {
  const text = [
    paper.title,
    paper.abstract,
    paper.venue,
    (paper.keywords || []).join(" "),
    (paper.openAlexTerms || []).join(" ")
  ].join(" ");
  const topicMatch = topics.some((topic) => textMatchesFocus(text, `${topic.name} ${topic.query}`));
  const fieldMatch =
    fieldLens.id === "all" || textMatchesFocus(text, `${fieldLens.label} ${fieldLens.query}`, { minHits: 1 });
  return topicMatch && fieldMatch;
}

function keywordList(text) {
  const stop = new Set([
    "with",
    "from",
    "using",
    "based",
    "between",
    "through",
    "towards",
    "toward",
    "learning",
    "model",
    "models",
    "analysis",
    "study",
    "data",
    "neural",
    "brain"
  ]);
  return normalizeText(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 4 && !stop.has(word))
    .slice(0, 80);
}

function scoreDetails(paper, topicNames, options = {}) {
  const ageDays = Math.max(
    0,
    Math.floor((Date.now() - new Date(paper.publicationDate || Date.now()).getTime()) / 86400000)
  );
  const citationVelocity = (paper.citedByCount || 0) / Math.max(1, ageDays + 1);
  const recency = options.allTime ? 0 : Math.max(0, 25 - ageDays * 0.18);
  const influence = Math.min(32, Math.log10((paper.citedByCount || 0) + 1) * 12 + Math.min(8, citationVelocity * 3));
  const text = `${paper.title} ${paper.abstract}`.toLowerCase();
  const relevance = topicNames.reduce((sum, topic) => {
    const parts = topic.toLowerCase().split(/\s+/);
    return sum + parts.filter((part) => text.includes(part)).length * 4;
  }, 0);
  const venueText = String(paper.venue || "").toLowerCase();
  const venue = venueSignals.some((signal) => venueText.includes(signal)) ? 10 : paper.venue ? 3 : 0;
  const evidence = normalizeText(paper.abstract).length > 500 ? 5 : 0;
  const boundedRelevance = Math.min(28, relevance);
  const significance = influence + boundedRelevance + venue + evidence;
  const score = Math.min(100, options.allTime ? significance : recency + significance);

  return {
    score: Math.round(score),
    significance: Math.round(Math.min(100, significance)),
    recencyScore: Math.round(recency),
    influenceScore: Math.round(influence),
    relevanceScore: Math.round(boundedRelevance),
    venueScore: Math.round(venue),
    evidenceScore: Math.round(evidence)
  };
}

function scorePaper(paper, topicNames, options = {}) {
  return scoreDetails(paper, topicNames, options).score;
}

function applyScores(paper, topicNames, options = {}) {
  const scores = scoreDetails(paper, topicNames, options);
  return {
    ...paper,
    ...scores,
    signals: [
      scores.influenceScore >= 20 ? "high citation signal" : "",
      scores.relevanceScore >= 12 ? "strong topic match" : "",
      scores.venueScore >= 10 ? "strong venue signal" : "",
      scores.evidenceScore > 0 ? "substantial abstract" : ""
    ].filter(Boolean)
  };
}

function convertOpenAlexWork(work, topicNames, options = {}) {
  const abstract = work.abstract_inverted_index
    ? Object.entries(work.abstract_inverted_index)
        .flatMap(([word, positions]) => positions.map((position) => [position, word]))
        .sort((a, b) => a[0] - b[0])
        .map((entry) => entry[1])
        .join(" ")
    : "";
  const openAlexTerms = [
    work.primary_topic?.display_name,
    work.primary_topic?.field?.display_name,
    work.primary_topic?.subfield?.display_name,
    ...(work.topics || []).flatMap((topic) => [
      topic.display_name,
      topic.field?.display_name,
      topic.subfield?.display_name
    ]),
    ...(work.concepts || []).map((concept) => concept.display_name),
    ...(work.keywords || []).map((keyword) => keyword.display_name)
  ].filter(Boolean);
  const paper = {
    id: work.id || work.doi || work.display_name,
    title: work.display_name || "Untitled work",
    abstract: normalizeText(abstract || work.title || ""),
    year: work.publication_year,
    publicationDate: work.publication_date || `${work.publication_year || ""}-01-01`,
    venue: work.primary_location?.source?.display_name || work.host_venue?.display_name || "Unknown venue",
    citedByCount: work.cited_by_count || 0,
    authors: (work.authorships || [])
      .slice(0, 5)
      .map((authorship) => authorship.author?.display_name)
      .filter(Boolean),
    url: work.primary_location?.landing_page_url || work.doi || work.id,
    doi: work.doi || "",
    topics: topicNames,
    source: "OpenAlex",
    keywords: [...new Set([...keywordList(`${work.display_name} ${abstract}`).slice(0, 8), ...openAlexTerms.slice(0, 6)])],
    openAlexTerms
  };
  return applyScores(paper, topicNames, options);
}

async function fetchOpenAlex(topic, days, fieldLens) {
  const allTime = days === "all";
  const scoreTopics = scoreTopicsForField([topic.name], fieldLens);
  const params = new URLSearchParams({
    search: queryForField(topic, fieldLens),
    filter: allTime ? "type:article|preprint" : `from_publication_date:${daysAgo(days)},type:article|preprint`,
    sort: "cited_by_count:desc",
    per_page: "25",
    mailto: "research-agent@example.com"
  });
  const response = await fetch(`https://api.openalex.org/works?${params}`, {
    headers: { "user-agent": "research-agent/0.1 (local prototype)" },
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) {
    throw new Error(`OpenAlex returned ${response.status}`);
  }
  const data = await response.json();
  return (data.results || []).map((work) => convertOpenAlexWork(work, scoreTopics, { allTime }));
}

async function fetchArxiv(topic, days, fieldLens) {
  const allTime = days === "all";
  const scoreTopics = scoreTopicsForField([topic.name], fieldLens);
  const topicQuery = `all:"${queryForArxiv(topic.name || topic.query)}"`;
  const fieldQuery = fieldLens.id === "all" ? "" : ` AND all:"${queryForArxiv(fieldLens.query || fieldLens.label)}"`;
  const params = new URLSearchParams({
    search_query: `${topicQuery}${fieldQuery}`,
    start: "0",
    max_results: "20",
    sortBy: allTime ? "relevance" : "submittedDate",
    sortOrder: "descending"
  });
  const response = await fetch(`https://export.arxiv.org/api/query?${params}`, {
    headers: { "user-agent": "papersignal/0.1 (local prototype)" },
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) {
    throw new Error(`arXiv returned ${response.status}`);
  }
  const xml = await response.text();
  const cutoff = allTime ? null : new Date(daysAgo(days));
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
    .map((match) => {
      const entry = match[1];
      const field = (name) => {
        const fieldMatch = entry.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`));
        return decodeXml(stripCdata(fieldMatch?.[1] || ""));
      };
      const published = field("published");
      const authors = [...entry.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>\s*<\/author>/g)]
        .slice(0, 5)
        .map((author) => decodeXml(author[1]));
      const paper = {
        id: field("id"),
        title: normalizeText(field("title")),
        abstract: normalizeText(field("summary")),
        year: new Date(published).getFullYear(),
        publicationDate: published.slice(0, 10),
        venue: "arXiv",
        citedByCount: 0,
        authors,
        url: field("id"),
        doi: "",
        topics: scoreTopics,
        source: "arXiv",
        keywords: keywordList(`${field("title")} ${field("summary")}`).slice(0, 8)
      };
      return paper;
    })
    .filter((paper) => paper.title && paper.url)
    .filter((paper) => !cutoff || new Date(paper.publicationDate) >= cutoff)
    .map((paper) => applyScores(paper, scoreTopics, { allTime }));
}

function queryForArxiv(value) {
  return normalizeText(value).replace(/"/g, "");
}

async function fetchPaperGroups(topics, days, fieldLens) {
  const primary = await Promise.allSettled(topics.map((topic) => fetchOpenAlex(topic, days, fieldLens)));
  const groups = primary.flatMap((result, index) =>
    result.status === "fulfilled"
      ? [result.value.filter((paper) => paperMatchesSelection(paper, [topics[index]], fieldLens))]
      : []
  );
  const errors = primary.flatMap((result) => (result.status === "rejected" ? [result.reason.message] : []));
  const openAlexCount = groups.flat().length;
  const providers = new Set(openAlexCount ? ["OpenAlex"] : []);

  if (errors.length || openAlexCount < Math.max(3, topics.length * 3)) {
    const fallback = await Promise.allSettled(topics.map((topic) => fetchArxiv(topic, days, fieldLens)));
    const arxivGroups = fallback.flatMap((result, index) =>
      result.status === "fulfilled"
        ? [result.value.filter((paper) => paperMatchesSelection(paper, [topics[index]], fieldLens))]
        : []
    );
    const arxivCount = arxivGroups.flat().length;
    if (arxivCount) {
      groups.push(...arxivGroups);
      providers.add("arXiv");
    }
    errors.push(...fallback.flatMap((result) => (result.status === "rejected" ? [result.reason.message] : [])));
  }

  if (!groups.flat().length) {
    throw new Error(errors[0] || "No live paper source returned results.");
  }

  return { groups, providers: [...providers] };
}

async function fetchGoogleNews(category, query) {
  const params = new URLSearchParams({
    q: query,
    hl: "en-US",
    gl: "US",
    ceid: "US:en"
  });
  const response = await fetch(`https://news.google.com/rss/search?${params}`, {
    headers: { "user-agent": "research-agent/0.1 (local prototype)" },
    signal: AbortSignal.timeout(8000)
  });
  if (!response.ok) {
    throw new Error(`Google News returned ${response.status}`);
  }
  const xml = await response.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 6).map((match, index) => {
    const item = match[1];
    const field = (name) => {
      const fieldMatch = item.match(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`));
      return decodeXml(stripCdata(fieldMatch?.[1] || ""));
    };
    const sourceMatch = item.match(/<source[^>]*>([\s\S]*?)<\/source>/);
    const source = decodeXml(stripCdata(sourceMatch?.[1] || "Google News"));
    const title = field("title").replace(new RegExp(`\\s+-\\s+${escapeRegExp(source)}$`, "i"), "");
    return {
      id: `${category}-google-${index}-${field("link")}`,
      title,
      source,
      category,
      publishedAt: new Date(field("pubDate") || Date.now()).toISOString(),
      url: field("link"),
      summary: decodeXml(stripCdata(field("description"))).replace(/\s+-\s+[^-]+$/, "")
    };
  });
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isLowValueNews(item) {
  const text = `${item.title} ${item.summary}`.toLowerCase();
  const noisyTerms = [
    "stock",
    "stocks",
    "investor",
    "isn't a buy",
    "buy now",
    "crypto",
    "price prediction",
    "market cap"
  ];
  return noisyTerms.some((term) => text.includes(term));
}

function newsStoryTerms(title) {
  const stop = new Set([
    "about",
    "against",
    "artificial",
    "calls",
    "could",
    "future",
    "intelligence",
    "new",
    "over",
    "says",
    "the",
    "this",
    "with"
  ]);
  return new Set(
    normalizeText(title)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stop.has(word))
  );
}

function sameNewsStory(left, right) {
  const normalizedLeft = normalizeText(left.title).toLowerCase();
  const normalizedRight = normalizeText(right.title).toLowerCase();
  if (normalizedLeft === normalizedRight) {
    return true;
  }
  const a = newsStoryTerms(left.title);
  const b = newsStoryTerms(right.title);
  const overlap = [...a].filter((term) => b.has(term)).length;
  const basis = Math.min(a.size, b.size);
  return basis > 0 && overlap >= 3 && overlap / basis >= 0.55;
}

function dedupeNews(items) {
  return items.reduce((unique, item) => {
    if (!unique.some((existing) => sameNewsStory(existing, item))) {
      unique.push(item);
    }
    return unique;
  }, []);
}

function selectedTopicNames(store, selected) {
  return selectedTopics(store, selected).map((topic) => topic.name);
}

function selectedTopics(store, selected) {
  if (!selected.length) return store.topics;
  const matches = store.topics.filter((topic) => selected.includes(topic.id));
  return matches.length ? matches : store.topics;
}

function classicMatchesTopic(classicPaper, topicNames) {
  const wanted = new Set(topicNames.map((topic) => topic.toLowerCase()));
  for (const topic of [...wanted]) {
    if (topic.includes("deep learning") || topic.includes("neural network") || topic.includes("foundation model")) {
      wanted.add("ai");
      wanted.add("data science");
      wanted.add("computational neuroscience");
    }
  }
  const classicTopics = classicPaper.topics.map((topic) => topic.toLowerCase());
  const searchable = [
    classicPaper.title,
    classicPaper.abstract,
    classicPaper.whyClassic,
    classicPaper.keywords?.join(" ")
  ]
    .join(" ")
    .toLowerCase();
  return classicTopics.some((topic) => wanted.has(topic)) || [...wanted].some((topic) => searchable.includes(topic));
}

function classicsForTopics(topicNames) {
  return classicPapers
    .filter((paper) => classicMatchesTopic(paper, topicNames))
    .map((paper) => ({
      ...paper,
      source: "Classic",
      signals: ["field-defining classic", ...(paper.signals || [])]
    }));
}

async function fetchHackerNewsDiscussion(topics, days, fieldLens) {
  const since = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000);
  const fieldTerms = fieldLens.id === "all" ? [] : [fieldLens.label, ...fieldLens.terms.slice(0, 3)];
  const topicQuery = [topics.map((topic) => topic.name).join(" "), fieldTerms.join(" ")]
    .filter(Boolean)
    .join(" ");
  const params = new URLSearchParams({
    query: topicQuery || "AI neuroscience BCI data science",
    tags: "story",
    numericFilters: `created_at_i>${since}`,
    hitsPerPage: "6"
  });
  const response = await fetch(`https://hn.algolia.com/api/v1/search_by_date?${params}`, {
    signal: AbortSignal.timeout(8000)
  });
  if (!response.ok) {
    throw new Error(`Hacker News returned ${response.status}`);
  }
  const data = await response.json();
  return (data.hits || []).map((hit) => ({
    id: `discussion-hn-${hit.objectID}`,
    title: normalizeText(hit.title || hit.story_title),
    source: "Hacker News",
    category: "discussion",
    publishedAt: hit.created_at,
    url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
    summary: `${hit.points || 0} points · ${hit.num_comments || 0} comments`
  }));
}

function newsTopicFocus(topics, fieldLens) {
  const topicPhrases = topics.map((topic) => `"${topic.name}"`);
  const topicFocus = topicPhrases.length ? `(${topicPhrases.join(" OR ")})` : '("artificial intelligence" OR neuroscience)';
  const fieldTerms = fieldLens.id === "all" ? [] : [fieldLens.label, ...fieldLens.terms.slice(0, 3)];
  const fieldPhrases = fieldTerms.map((term) => `"${term}"`);
  return fieldPhrases.length ? `${topicFocus} (${fieldPhrases.join(" OR ")})` : topicFocus;
}

function containsAnyTerm(text, terms) {
  const normalized = normalizeText(text).toLowerCase();
  return terms.some((term) => normalized.includes(term.toLowerCase()));
}

function newsFocusTerms(topics, fieldLens) {
  const topicTerms = topics.flatMap((topic) => [topic.name, ...keywordList(topic.query || topic.name).slice(0, 6)]);
  const fieldTerms = fieldLens.id === "all" ? [] : [fieldLens.label, ...fieldLens.terms];
  return {
    topicTerms: [...new Set(topicTerms.filter(Boolean))],
    fieldTerms: [...new Set(fieldTerms.filter(Boolean))]
  };
}

function matchesNewsFocus(item, topics, fieldLens) {
  const { topicTerms, fieldTerms } = newsFocusTerms(topics, fieldLens);
  const text = `${item.title} ${item.summary} ${item.source}`;
  const topicMatch = !topicTerms.length || containsAnyTerm(text, topicTerms);
  const fieldMatch = !fieldTerms.length || containsAnyTerm(text, fieldTerms);
  return topicMatch && fieldMatch;
}

async function fetchTrendNews(topics, days, fieldLens, options = {}) {
  const focus = newsTopicFocus(topics, fieldLens);
  const academiaQuery =
    `${focus} (research OR university OR paper OR lab) -stock -investor -crypto when:${days}d`;
  const industryQuery =
    `${focus} (company OR startup OR product OR funding OR regulation) -stock -investor -crypto when:${days}d`;
  const [academia, industry, discussion] = await Promise.all([
    fetchGoogleNews("academia", academiaQuery),
    fetchGoogleNews("industry", industryQuery),
    fetchHackerNewsDiscussion(topics, days, fieldLens)
  ]);
  const ordered = [...academia, ...industry, ...discussion]
    .filter((item) => item.title && item.url)
    .filter((item) => !isLowValueNews(item))
    .filter((item) => (options.skipFocusFilter ? true : matchesNewsFocus(item, topics, fieldLens)))
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  return dedupeNews(ordered).slice(0, 18);
}

async function trendNews(topics, fieldLens) {
  const today = await fetchTrendNews(topics, 1, fieldLens);
  if (today.length) {
    return { items: today, days: 1, scope: "topic_field" };
  }
  const week = await fetchTrendNews(topics, 7, fieldLens);
  if (week.length) {
    return { items: week, days: 7, scope: "topic_field" };
  }
  const month = await fetchTrendNews(topics, 30, fieldLens);
  if (month.length) {
    return { items: month, days: 30, scope: "topic_field" };
  }
  if (fieldLens.id !== "all") {
    const topicOnlyLens = fieldLensFromFields([]);
    const topicOnlyToday = await fetchTrendNews(topics, 1, topicOnlyLens);
    if (topicOnlyToday.length) {
      return { items: topicOnlyToday, days: 1, scope: "topic_fallback" };
    }
    const topicOnlyWeek = await fetchTrendNews(topics, 7, topicOnlyLens);
    if (topicOnlyWeek.length) {
      return { items: topicOnlyWeek, days: 7, scope: "topic_fallback" };
    }
    return { items: await fetchTrendNews(topics, 30, topicOnlyLens), days: 30, scope: "topic_fallback" };
  }
  return { items: [], days: 30, scope: "topic_field" };
}

function mergePapers(paperGroups, topicNames, minSignificance, options = {}) {
  const byId = new Map();
  for (const paper of paperGroups.flat()) {
    const existing = byId.get(paper.id);
    if (existing) {
      existing.topics = [...new Set([...existing.topics, ...paper.topics])];
      byId.set(existing.id, applyScores(existing, topicNames, options));
    } else {
      byId.set(paper.id, { ...paper });
    }
  }
  const ranked = [...byId.values()]
    .map((paper) => applyScores(paper, topicNames, options))
    .sort((a, b) => {
      const classicDelta = Number(b.source === "Classic") - Number(a.source === "Classic");
      return classicDelta || b.significance - a.significance || b.score - a.score || b.citedByCount - a.citedByCount;
    })
    .slice(0, 60);
  const significant = ranked.filter((paper) => paper.significance >= minSignificance);
  if (significant.length) {
    return { papers: significant, rankingMode: "significant" };
  }
  return {
    papers: ranked.slice(0, 12).map((paper) => ({
      ...paper,
      signals: ["best available for this topic", ...(paper.signals || [])]
    })),
    rankingMode: "best-available"
  };
}

function computeTrends(papers) {
  const counts = new Map();
  for (const paper of papers) {
    for (const keyword of paper.keywords || keywordList(`${paper.title} ${paper.abstract}`).slice(0, 8)) {
      counts.set(keyword, (counts.get(keyword) || 0) + 1 + Math.min(4, Math.floor((paper.score || 0) / 25)));
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16)
    .map(([name, weight]) => ({ name, weight }));
}

function getClassics(store, url) {
  const selected = (url.searchParams.get("topics") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return classicsForTopics(selectedTopicNames(store, selected));
}

async function discover(req, res, url) {
  const store = await readStore();
  const selected = (url.searchParams.get("topics") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const selectedFieldIds = (url.searchParams.get("field") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const dayWindow = url.searchParams.get("days") || "90";
  const days = dayWindow === "all" ? "all" : Number.parseInt(dayWindow, 10);
  const allTime = days === "all";
  const minSignificance = Number.parseInt(url.searchParams.get("minSignificance") || "34", 10);
  const topics = selectedTopics(store, selected);
  const fields = selectedFields(store, selectedFieldIds);
  const fieldLens = fieldLensFromFields(fields);
  const topicNames = topics.map((topic) => topic.name);
  const scoreTopicNames = scoreTopicsForField(topicNames, fieldLens);

  try {
    const sourceResult = await fetchPaperGroups(topics, days, fieldLens);
    const groups = [...sourceResult.groups];
    if (allTime) {
      groups.unshift(classicsForTopics(scoreTopicNames));
    }
    const result = mergePapers(groups, scoreTopicNames, minSignificance, { allTime });
    sendJson(res, 200, {
      status: "live",
      updatedAt: new Date().toISOString(),
      minSignificance,
      rankingMode: allTime ? "all-time" : result.rankingMode,
      dayWindow,
      field: { id: fieldLens.id, label: fieldLens.label },
      providers: allTime ? ["Classic", ...sourceResult.providers] : sourceResult.providers,
      topics,
      papers: result.papers,
      trends: computeTrends(result.papers)
    });
  } catch (error) {
    const fallback = samplePapers
      .filter((paper) => paperMatchesSelection(paper, topics, fieldLens))
      .map((paper) => applyScores(paper, scoreTopicNames));
    const emptyRelevantResult = !fallback.length && error.message.includes("No live paper source returned results");
    sendJson(res, 200, {
      status: emptyRelevantResult ? "empty" : "sample",
      message: error.message,
      updatedAt: new Date().toISOString(),
      minSignificance,
      rankingMode: emptyRelevantResult ? "empty" : "sample",
      field: { id: fieldLens.id, label: fieldLens.label },
      topics,
      papers: fallback,
      trends: computeTrends(fallback)
    });
  }
}

async function serveStatic(req, res, url) {
  const pathname = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = resolve(join(PUBLIC_DIR, pathname));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  try {
    const data = await readFile(filePath);
    res.writeHead(200, { "content-type": mimeTypes[extname(filePath)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname === "/api/topics" && req.method === "GET") {
      const store = await readStore();
      sendJson(res, 200, store.topics);
      return;
    }
    if (url.pathname === "/api/fields" && req.method === "GET") {
      const store = await readStore();
      sendJson(res, 200, store.fields);
      return;
    }
    if (url.pathname === "/api/fields" && req.method === "POST") {
      const store = await readStore();
      const body = await readBody(req);
      const name = normalizeText(body.name);
      const query = normalizeText(body.query || body.name);
      if (!name || !query) {
        sendJson(res, 400, { error: "Field name and query are required." });
        return;
      }
      const field = {
        id: slug(name),
        name,
        query,
        color: body.color || "#536fb8"
      };
      store.fields = [...store.fields.filter((item) => item.id !== field.id), field];
      await writeStore(store);
      sendJson(res, 201, field);
      return;
    }
    if (url.pathname.startsWith("/api/fields/") && req.method === "DELETE") {
      const store = await readStore();
      const fieldId = decodeURIComponent(url.pathname.slice("/api/fields/".length));
      const existing = store.fields.find((field) => field.id === fieldId);
      if (!existing) {
        sendJson(res, 404, { error: "Field not found." });
        return;
      }
      store.fields = store.fields.filter((field) => field.id !== fieldId);
      await writeStore(store);
      sendJson(res, 200, existing);
      return;
    }
    if (url.pathname === "/api/topics" && req.method === "POST") {
      const store = await readStore();
      const body = await readBody(req);
      const name = normalizeText(body.name);
      const query = normalizeText(body.query || body.name);
      if (!name || !query) {
        sendJson(res, 400, { error: "Topic name and query are required." });
        return;
      }
      const topic = {
        id: slug(name),
        name,
        query,
        color: body.color || "#2f6f73"
      };
      store.topics = [...store.topics.filter((item) => item.id !== topic.id), topic];
      await writeStore(store);
      sendJson(res, 201, topic);
      return;
    }
    if (url.pathname.startsWith("/api/topics/") && req.method === "DELETE") {
      const store = await readStore();
      const topicId = decodeURIComponent(url.pathname.slice("/api/topics/".length));
      const existing = store.topics.find((topic) => topic.id === topicId);
      if (!existing) {
        sendJson(res, 404, { error: "Topic not found." });
        return;
      }
      store.topics = store.topics.filter((topic) => topic.id !== topicId);
      await writeStore(store);
      sendJson(res, 200, existing);
      return;
    }
    if (url.pathname === "/api/discover" && req.method === "GET") {
      await discover(req, res, url);
      return;
    }
    if (url.pathname === "/api/classics" && req.method === "GET") {
      const store = await readStore();
      sendJson(res, 200, getClassics(store, url));
      return;
    }
    if (url.pathname === "/api/trend-news" && req.method === "GET") {
      try {
        const store = await readStore();
        const selected = (url.searchParams.get("topics") || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        const selectedFieldIds = (url.searchParams.get("field") || "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        const topics = selectedTopics(store, selected);
        const fieldLens = fieldLensFromFields(selectedFields(store, selectedFieldIds));
        const result = await trendNews(topics, fieldLens);
        sendJson(res, 200, {
          status: "live",
          updatedAt: new Date().toISOString(),
          topics: topics.map((topic) => topic.name),
          field: { id: fieldLens.id, label: fieldLens.label },
          days: result.days,
          scope: result.scope,
          items: result.items
        });
      } catch (error) {
        sendJson(res, 200, {
          status: "sample",
          message: error.message,
          updatedAt: new Date().toISOString(),
          days: 1,
          items: sampleTrendNews
        });
      }
      return;
    }
    if (url.pathname === "/api/saved" && req.method === "GET") {
      const store = await readStore();
      sendJson(res, 200, store.saved || []);
      return;
    }
    if (url.pathname === "/api/saved" && req.method === "POST") {
      const store = await readStore();
      const paper = await readBody(req);
      store.saved = [paper, ...(store.saved || []).filter((item) => item.id !== paper.id)].slice(0, 200);
      await writeStore(store);
      sendJson(res, 201, paper);
      return;
    }
    await serveStatic(req, res, url);
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`PaperSignal running at http://${HOST}:${PORT}`);
});
