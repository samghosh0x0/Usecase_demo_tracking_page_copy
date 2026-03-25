import fs from "fs";
import fetch from "node-fetch";

const API_KEY = process.env.ASTHA_API_KEY;
const COLLECTION = process.env.ASTHA_COLLECTION_TOKEN;
const BASE_URL = `https://api.asthalavista.com/v1/collection_api/${COLLECTION}`;
const CUTOFFS = ["1d", "3d", "7d", "10d"];

async function fetchFeed(cutoff) {
  const res = await fetch(`${BASE_URL}?cutoff=${cutoff}`, {
    headers: {
      "X-API-Key": API_KEY,
    },
  });

  const data = await res.json();

  // Normalize (important)
  return {
    cutoff,
    timestamp: new Date().toISOString(),
    total_sources: data.sources.length,
    sources: data.sources.map((s) => ({
      title: s.title,
      type: s.type,
      link: s.link,
      summary: s.summary || null,
    })),
  };
}

async function main() {
  for (const cutoff of CUTOFFS) {
    console.log(`Fetching ${cutoff}...`);

    const feed = await fetchFeed(cutoff);

    fs.writeFileSync(
      `data/ai_feed_${cutoff}.json`,
      JSON.stringify(feed, null, 2)
    );
  }
}

main();
