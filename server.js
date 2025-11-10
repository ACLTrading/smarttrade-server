import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const SHARED_SECRET = process.env.SHARED_SECRET || "Armstrong_1980-()@";

// in-memory storage
let signals = [];
let newsCache = [];
let eventsCache = [];

// MT4 posts here
app.post("/update_signals", (req, res) => {
  const body = req.body;

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

  // keep latest 20
  signals = [sig, ...signals].slice(0, 20);

  return res.json({ status: "ok", received: sig });
});

// dashboard pulls from here
app.get("/signals", (req, res) => {
  res.json({ signals });
});

// news
app.get("/news", (req, res) => {
  if (!newsCache.length) {
    newsCache = [
      { title: "Fed officials reiterate data-dependent stance", tag: "High", time: "09:05" },
      { title: "EUR pressured after soft German data", tag: "Med", time: "09:22" },
      { title: "Gold holds gains as dollar eases", tag: "Low", time: "09:34" }
    ];
  }
  res.json({ news: newsCache });
});

// economic events
app.get("/events", (req, res) => {
  if (!eventsCache.length) {
    eventsCache = [
      { title: "US CPI m/m", impact: "RED", time: "08:30" },
      { title: "ECB Minutes", impact: "AMBER", time: "09:00" },
      { title: "BoE Gov speaks", impact: "YELLOW", time: "11:10" }
    ];
  }
  res.json({ events: eventsCache });
});

app.get("/", (req, res) => {
  res.send("SmartTrade server is running ✅");
});

app.listen(PORT, () => console.log("SmartTrade server listening on", PORT));
