# PaperSignal

A local research radar for tracking significant recent papers, all-time classics, and trend news across your research interests.

## Run

Requires Node.js 20 or newer.

```bash
npm start
```

Then open:

```text
http://127.0.0.1:4173
```

## What It Does

- Loads your research interests from `data/store.json`.
- Fetches recent works from OpenAlex by default.
- Automatically falls back to arXiv when OpenAlex fails or returns too few live results.
- Filters recent works by significance before ranking them.
- Scores significance with citation signal, topic relevance, venue signal, and available abstract evidence.
- Extracts trend keywords from the current result set.
- Shows today's trend news across academia, industry, and discussion sources.
- Separates a curated Classic Paper Library for landmark work such as backpropagation, AlexNet, transformers, BCI foundations, and core neuroscience models.
- Lets you save papers locally.
- Falls back to sample records only if live paper sources are unavailable.

## Local Data

Your topics and saved papers live in `data/store.json`. This file is ignored by Git so personal research interests and saved items are not pushed to GitHub.

To start from the example data:

```bash
cp data/store.example.json data/store.json
```

## Next Useful Upgrades

- Add embeddings for semantic matching to your saved papers.
- Add daily digest automation.
- Add LLM paper summaries and "why this matters" analysis.
- Add trend history so the app can detect rising topics over weeks.
