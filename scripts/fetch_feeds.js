const fs = require("fs");

// -----------------------------
// ENV CHECK
// -----------------------------
const API_KEY = process.env.ASTHA_API_KEY;
const COLLECTION = process.env.ENCODED_COLLECTION_TOKEN;

console.log("=== ENV DEBUG ===");
console.log("API_KEY exists:", !!API_KEY);
console.log("COLLECTION exists:", !!COLLECTION);

if (!API_KEY || !COLLECTION) {
  console.error("❌ Missing environment variables");
  process.exit(1);
}

// -----------------------------
// CONFIG
// -----------------------------
const BASE_URL = `https://api.asthalavista.com/v1/collection_api/${COLLECTION}`;
const CUTOFF = 7;

// -----------------------------
// HEADERS (IMPORTANT FIX)
// -----------------------------
const DEFAULT_HEADERS = {
  "X-API-Key": API_KEY,
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json",
  "Accept-Language": "en-US,en;q=0.9",
  "Connection": "keep-alive",
};

// -----------------------------
// SAFE FETCH WRAPPER
// -----------------------------
async function safeFetch(url, retries = 2) {
  console.log("\n➡️ Calling URL:", url);

  try {
    const res = await fetch(url, {
      headers: DEFAULT_HEADERS,
    });

    console.log("Status:", res.status);

    const text = await res.text();
    console.log("Raw response (first 300 chars):", text.slice(0, 300));

    // 🚨 Detect Cloudflare / HTML block
    if (text.startsWith("<!DOCTYPE html>")) {
      console.error("❌ Blocked by Cloudflare / HTML response detected");

      if (retries > 0) {
        console.log("🔁 Retrying...");
        await new Promise((r) => setTimeout(r, 2000));
        return safeFetch(url, retries - 1);
      }

      throw new Error("Blocked by Cloudflare");
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("❌ JSON parse failed");
      throw e;
    }

    if (!res.ok) {
      console.error("❌ API returned error:", data);
      throw new Error("API error");
    }

    return data;
  } catch (err) {
    console.error("❌ Fetch failed:", err.message);
    throw err;
  }
}

// -----------------------------
// STAGE 1
// -----------------------------
async function fetchStage1() {
  console.log("\n=== STAGE 1 ===");

  const url = `${BASE_URL}?cutoff=${CUTOFF}`;

  const data = await safeFetch(url);

  if (!data.sources) {
    console.error("❌ No sources returned");
    process.exit(1);
  }

  console.log("✅ Sources received:", data.sources.length);

  return data.sources;
}

// -----------------------------
// STAGE 2
// -----------------------------
async function fetchStage2(link) {
  console.log("\n--- STAGE 2 ---");

  const data = await safeFetch(link);

  if (!data.data) {
    console.warn("⚠️ No data field in response");
    return null;
  }

  console.log("✅ Items fetched:", data.data.length);

  return data;
}

// -----------------------------
// MAIN FLOW
// -----------------------------
async function main() {
  try {
    console.log("\n=== STARTING JOB ===");

    const sources = await fetchStage1();

    const result = {
      cutoff: CUTOFF,
      timestamp: new Date().toISOString(),
      categories: {},
    };

    for (const source of sources) {
      console.log("\nProcessing category:", source.category);

      if (!source.link) {
        console.warn("⚠️ Missing link, skipping");
        continue;
      }

      const data = await fetchStage2(source.link);

      if (!data || !data.data) {
        console.warn("⚠️ No usable data for", source.category);
        continue;
      }

      result.categories[source.category] = {
        count: data.meta?.document_count || 0,
        items: data.data,
      };
    }

    console.log("\n=== WRITING FILE ===");

    if (!fs.existsSync("data")) {
      fs.mkdirSync("data");
    }

    fs.writeFileSync(
      `data/ai_feed_${CUTOFF}.json`,
      JSON.stringify(result, null, 2)
    );

    console.log("✅ File written successfully");
  } catch (err) {
    console.error("\n❌ SCRIPT FAILED:", err.message);
    process.exit(1);
  }
}

main();
