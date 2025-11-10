import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

// accept normal JSON
app.use(express.json({ limit: "1mb" }));
// ALSO accept text/plain or unknown content-type (MT4 sometimes does this)
app.use(express.text({ type: "*/*", limit: "1mb" }));

const PORT = process.env.PORT || 10000;
const SHARED_SECRET = process.env.SHARED_SECRET || "Armstrong_1980-()@";

// in-memory storage
let signals = [];
let newsCache = [];
let eventsCache = [];

// MT4 posts here
app.post("/update_signals", (req, res) => {
  let body = req.body;

  // if MT4 sent text, try to turn it into JSON
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: "invalid json" });
    }
  }

  // now do the auth check
  if (!body.secret || body.secret !== SHARED_SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const sig = {
    symbol: body.symbol,
    direction: body.direction,
    entry: body.entry,
    sl: body.sl,
    tp: body.tp,
    reason: body.reason,
    tier: body.tier || "Tier 2",
    rr: "1:1.5",
    time: new Date().toISOString(),
  };

  // keep latest 20 signals
  signals = [sig, ...signals].slice(0, 20);

  return res.json({ status: "ok", received: sig });
});

// dashboard pulls here
app.get("/signals", (req, res) => {
  res.json({ signals });
});

// static news
app.get("/news", (req, res) => {
  if (!newsCache.length) {
    newsCache = [
      { title: "Fed officials reiterate data-dependent stance", tag: "High", time: "09:05" },
      { title: "EUR pressured after soft German data", tag: "Med", time: "09:22" },
      { title: "Gold holds gains as dollar eases", tag: "Low", time: "09:34" },
    ];
  }
  res.json({ news: newsCache });
});

// static events
app.get("/events", (req, res) => {
  if (!eventsCache.length) {
    eventsCache = [
      { title: "US CPI m/m", impact: "RED", time: "08:30" },
      { title: "ECB Minutes", impact: "AMBER", time: "09:00" },
      { title: "BoE Gov speaks", impact: "YELLOW", time: "11:10" },
    ];
  }
  res.json({ events: eventsCache });
});

app.get("/", (req, res) => {
  res.send("SmartTrade server is running ✅");
});

app.listen(PORT, () => {
  console.log("SmartTrade server listening on", PORT);
});
