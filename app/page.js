"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState(null);
  const [cutoff, setCutoff] = useState(7);
  const [summary, setSummary] = useState("");

  useEffect(() => {
    fetch(`/data/ai_feed_${cutoff}.json`)
      .then((res) => res.json())
      .then(setData);
  }, [cutoff]);

  async function generateSummary() {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer YOUR_OPENROUTER_KEY`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct",
        messages: [
          {
            role: "system",
            content:
              "You are an AI analyst. Create a sharp weekly AI summary with insights.",
          },
          {
            role: "user",
            content: JSON.stringify(data),
          },
        ],
      }),
    });

    const json = await res.json();
    setSummary(json.choices[0].message.content);
  }

  if (!data) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>AI Intelligence Feed</h1>

      <select onChange={(e) => setCutoff(e.target.value)}>
        <option value={1}>1 Day</option>
        <option value={3}>3 Days</option>
        <option value={7}>7 Days</option>
        <option value={10}>10 Days</option>
      </select>

      <button onClick={generateSummary}>Generate Summary</button>

      {summary && (
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 20 }}>
          {summary}
        </pre>
      )}

      {Object.entries(data.categories).map(([key, value]) => (
        <div key={key} style={{ marginTop: 30 }}>
          <h2>{key.toUpperCase()} ({value.count})</h2>

          {value.items.map((item, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <a href={item.url} target="_blank">
                <b>{item.subject}</b>
              </a>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
