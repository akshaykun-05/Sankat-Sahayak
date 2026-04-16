if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

// ── Config ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error("[ERROR] GROQ_API_KEY is missing. Add it to your .env file.");
  process.exit(1);
}

// ── Groq client ──────────────────────────────────────────────────────────────
const groq = new Groq({ apiKey: GROQ_API_KEY });

// ── Express app ──────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a legal document assistant. Generate a formal First Information Report (FIR) in Indian format based on the incident description provided.

Rules:
- Include plausible date, time, and location derived from the description.
- Maintain a neutral, formal tone throughout.
- Do NOT hallucinate or fabricate IPC sections. Do not mention any IPC section unless it is clearly and obviously applicable.
- Output MUST be valid JSON with exactly two keys: "fir_english" (FIR in English) and "fir_hindi" (same FIR in Hindi).
- Do not wrap the JSON in markdown code fences or add any text outside the JSON object.`;

// ── GET /test ────────────────────────────────────────────────────────────────
app.get("/test", (req, res) => {
  console.log("[GET /test] Health check requested.");
  return res.json({ message: "API working" });
});

// ── GET / ────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  return res.json({ status: "ok", endpoints: ["POST /generate-fir", "GET /test"] });
});
//---------------------------------------------------
function cleanText(text) {
  return text
    .replace(/\[.*?\]/g, "") // remove placeholders like [To be filled]
    .replace(/\s+/g, " ")    // fix spacing
    .trim();
}
function formatFIR(data) {
  let text = "";

  for (const section in data) {
    text += `${section.replace(/_/g, " ").toUpperCase()}:\n`;

    const sectionData = data[section];

    // 🔥 If it's an object → iterate
    if (sectionData && typeof sectionData === "object" && !Array.isArray(sectionData)) {
      for (const key in sectionData) {
        let value = sectionData[key];

        // ✅ Convert EVERYTHING to string safely
        if (typeof value === "object") {
          value = JSON.stringify(value);
        }

        text += `- ${key}: ${value}\n`;
      }
    } else {
      // 🔥 Direct string case
      let value = sectionData;

      if (typeof value === "object") {
        value = JSON.stringify(value);
      }

      text += `- ${value}\n`;
    }

    text += "\n";
  }

  return text;
}
// ── POST /generate-fir ───────────────────────────────────────────────────────
//
// Sample curl command to test this endpoint:
//
// curl -X POST http://localhost:3000/generate-fir \
//   -H "Content-Type: application/json" \
//   -d '{"description": "A car hit a pedestrian near Connaught Place, New Delhi at night."}'
//
app.post("/generate-fir", async (req, res) => {
  try {
    const { description } = req.body;

    // ── Input validation ─────────────────────────────────────────────────────
    if (!description || typeof description !== "string" || !description.trim()) {
      return res
        .status(400)
        .json({ error: "A non-empty 'description' string is required." });
    }

    console.log("[POST /generate-fir] Request received.");
    console.log("[POST /generate-fir] Input description:", description.trim());
    console.log("USING MODEL: llama-3.1-8b-instant");
    //-function calling code-----------------------------------------------------

    // ── Call Groq ────────────────────────────────────────────────────────────
    const userPrompt = `Incident description:\n"${description.trim()}"`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const raw = completion.choices[0].message.content.trim();
    console.log("[POST /generate-fir] Raw LLM response:", raw);

    // Strip possible markdown code fences the model might add
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "");

    // ── Parse JSON ───────────────────────────────────────────────────────────
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("JSON parse failed, attempting fix...");

      // Fix common issues like 1/2024 → "1/2024"
      const fixed = cleaned.replace(/:\s*([0-9]+\/[0-9]+)/g, ': "$1"');

      try {
        parsed = JSON.parse(fixed);
      } catch (e2) {
        console.error("[POST /generate-fir] Still failed after fix.");
        return res.status(502).json({
          error: "LLM returned malformed JSON",
          raw_response: raw,
        });
      }
    }

    if (!parsed.fir_english || !parsed.fir_hindi) {
      console.error("[POST /generate-fir] LLM response missing required fields.");
      return res.status(502).json({
        error: "LLM response missing required fields (fir_english / fir_hindi).",
        raw_response: parsed,
      });
    }

    console.log("[POST /generate-fir] FIR generated successfully.");
    return res.json({
      fir_english: cleanText(formatFIR(parsed.fir_english)),
      fir_hindi: cleanText(formatFIR(parsed.fir_hindi)),
    });
  } catch (err) {
    console.error("[POST /generate-fir] Unexpected error:", err.message);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
});

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[SERVER] FIR Generator API running on http://localhost:${PORT}`);
  console.log(`[SERVER] Test route: GET  http://localhost:${PORT}/test`);
  console.log(`[SERVER] FIR route:  POST http://localhost:${PORT}/generate-fir`);
});
