# AI Intelligence Feed (Astha La Vista Demo)

A lightweight AI intelligence feed and content engine built using the Astha La Vista API.

👉 Live Demo: [https://samghosh0x0.github.io/Usecase_demo_tracking_page_copy/](https://samghosh0x0.github.io/Usecase_demo_tracking_page_copy/)

---

## 🚀 What This Does

This project creates a **weekly AI intelligence feed** by:

1. Fetching structured signals from the Astha La Vista API
2. Aggregating across multiple categories
3. Generating AI-powered summaries using OpenRouter
4. Publishing a clean, shareable UI via GitHub Pages

---

## 🧠 Categories Covered

The feed is structured into four signal layers:

- **News** → AI trends and major developments  
- **Papers** → Research from arXiv  
- **Models** → New/updated AI models  
- **Projects** → Trending GitHub repositories  

Each category is normalized into a common schema:

```json
{
  "subject": "...",
  "body": "...",
  "timestamp": "...",
  "url": "...",
  "extras": {...}
}
