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
const SYSTEM_PROMPT = `You are a legal document assistant for Indian Police. Generate a formal First Information Report (FIR) in the official Indian police format.

OUTPUT RULES:
- Output MUST be valid JSON with exactly two keys: "fir_english" (string) and "fir_hindi" (string).
- Both values are plain text strings. Do NOT use markdown, HTML, or nested JSON inside the strings.
- Do NOT wrap the JSON in markdown code fences or add any text outside the JSON object.
- Do NOT fabricate IPC/BNS sections. Include only clearly applicable sections.

FIR STRUCTURE (apply to BOTH English and Hindi):
- Each section heading on its own line in ALL CAPS followed by a colon.
- Every piece of content under a heading starts with "  \u2022 " (two spaces, bullet, space).
- Leave exactly one blank line between sections.
- Use this exact order of sections with NO additions, duplications, or omissions:

  1. CASE DIARY NUMBER
  2. DATE AND TIME OF OCCURRENCE
  3. PLACE OF OCCURRENCE
  4. INFORMATION PROVIDED BY
  5. STATEMENT
  6. DETAILS OF INJURED / DECEASED PERSON
  7. NATURE OF INJURIES
  8. POLICE STATION
  9. NAME AND ADDRESS OF COMPLAINANT / VICTIM
  10. SECTIONS APPLIED
  11. SIGNATURE OF INFORMANT
  12. SIGNATURE OF SHO / INSPECTING OFFICER

EXAMPLE OUTPUT FORMAT (English):
CASE DIARY NUMBER:
  \u2022 CD No. 142/2024

DATE AND TIME OF OCCURRENCE:
  \u2022 Date: 15/04/2024
  \u2022 Time: 10:30 PM

PLACE OF OCCURRENCE:
  \u2022 Near Connaught Place, New Delhi, Delhi - 110001

INFORMATION PROVIDED BY:
  \u2022 Rahul Sharma (Eyewitness)

STATEMENT:
  \u2022 On the night of 15th April 2024, at approximately 10:30 PM, a speeding vehicle struck a pedestrian at Connaught Place. The victim sustained serious injuries and was immediately rushed to hospital. The accused fled the scene.

DETAILS OF INJURED / DECEASED PERSON:
  \u2022 Name: Not identified
  \u2022 Age: Approximately 35 years
  \u2022 Gender: Male

NATURE OF INJURIES:
  \u2022 Serious head injuries and multiple fractures reported. Victim in critical condition.

POLICE STATION:
  \u2022 Connaught Place Police Station, New Delhi

NAME AND ADDRESS OF COMPLAINANT / VICTIM:
  \u2022 Name: Rahul Sharma
  \u2022 Address: 12, Rajpur Road, Delhi - 110054

SECTIONS APPLIED:
  \u2022 BNS Section 281 (Rash driving on public way)
  \u2022 BNS Section 125 (Act endangering life)

SIGNATURE OF INFORMANT:
  \u2022 Rahul Sharma

SIGNATURE OF SHO / INSPECTING OFFICER:
  \u2022 Inspector Anil Kumar, Connaught Place Police Station

HINDI RULES (for fir_hindi):
- Translate ALL content — including section headings — into formal legal Hindi.
- Do NOT use English words. Use proper Hindi equivalents:
  - accident \u2192 \u0926\u0941\u0930\u094d\u0918\u091f\u0928\u093e, vehicle \u2192 \u0935\u093e\u0939\u0928, nearby \u2192 \u0928\u093f\u0915\u091f, injuries \u2192 \u091a\u094b\u091f\u0947\u0902, complainant \u2192 \u0936\u093f\u0915\u093e\u092f\u0924\u0915\u0930\u094d\u0924\u093e, station \u2192 \u0925\u093e\u0928\u093e
- Hindi section headings (use exactly):
  \u0915\u0947\u0938 \u0921\u093e\u092f\u0930\u0940 \u0938\u0902\u0916\u094d\u092f\u093e: | \u0918\u091f\u0928\u093e \u0915\u0940 \u0924\u093f\u0925\u093f \u090f\u0935\u0902 \u0938\u092e\u092f: | \u0918\u091f\u0928\u093e\u0938\u094d\u0925\u0932: | \u0938\u0942\u091a\u0928\u093e \u092a\u094d\u0930\u0926\u093e\u0924\u093e: | \u0935\u093f\u0935\u0930\u0923: | \u0918\u093e\u092f\u0932 / \u092e\u0943\u0924\u0915 \u0915\u093e \u0935\u093f\u0935\u0930\u0923: | \u091a\u094b\u091f\u094b\u0902 \u0915\u0940 \u092a\u094d\u0930\u0915\u0943\u0924\u093f: | \u0925\u093e\u0928\u093e: | \u0936\u093f\u0915\u093e\u092f\u0924\u0915\u0930\u094d\u0924\u093e / \u092a\u0940\u0921\u093c\u093f\u0924 \u0915\u093e \u0928\u093e\u092e \u090f\u0935\u0902 \u092a\u0924\u093e: | \u0932\u093e\u0917\u0942 \u0927\u093e\u0930\u093e\u090f\u0901: | \u0938\u0942\u091a\u0928\u093e\u0926\u093e\u0924\u093e \u0915\u0947 \u0939\u0938\u094d\u0924\u093e\u0915\u094d\u0937\u0930: | \u0925\u093e\u0928\u093e\u0927\u094d\u092f\u0915\u094d\u0937 / \u0928\u093f\u0930\u0940\u0915\u094d\u0937\u0923 \u0905\u0927\u093f\u0915\u093e\u0930\u0940 \u0915\u0947 \u0939\u0938\u094d\u0924\u093e\u0915\u094d\u0937\u0930:
- Bullet format remains: "  \u2022 " prefix`;

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
// cleanText: strip any leftover placeholder brackets only; preserve line breaks
function cleanText(text) {
  if (typeof text !== "string") return String(text);
  return text
    .replace(/\[.*?\]/g, "") // remove placeholders like [To be filled]
    .trim();
}

// formatFIR: AI now returns pre-formatted plain text; just pass it through
function formatFIR(data) {
  if (typeof data === "string") return data;
  // Fallback for unexpected object shape
  return Object.entries(data)
    .map(([k, v]) => `${k.replace(/_/g, " ").toUpperCase()}:\n  \u2022 ${v}`)
    .join("\n\n");
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
