// File: backend/aiService.js
const OpenAI = require("openai");

class AIService {
  constructor() {
    console.log("🧠 AI Service - Unified OpenAI + Local Fallback Engine Initialized");

    try {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || "",
      });
      console.log("✅ Unified AI Service Ready");
    } catch (error) {
      console.error("💥 Failed to initialize OpenAI:", error.message);
      this.openai = null;
    }
  }

  // ---------- 🧩 Generic helper to safely call OpenAI ----------
  async callOpenAI(messages, opts = {}) {
    if (!this.openai) throw new Error("OpenAI client not initialized");

    const model = opts.model || "gpt-4o-mini";
    const max_tokens = opts.max_tokens || 150;
    const temperature = typeof opts.temperature === "number" ? opts.temperature : 0.7;

    // --- Try modern (chat.completions.create) API first ---
    try {
      if (this.openai.chat?.completions?.create) {
        const response = await this.openai.chat.completions.create({
          model,
          messages,
          temperature,
          max_tokens,
        });
        const text = response.choices?.[0]?.message?.content?.trim?.() || "";
        return { text, raw: response };
      }
    } catch (err) {
      console.warn("⚠️ callOpenAI (chat API) failed:", err.message);
    }

    // --- Try fallback (responses.create) for new SDKs ---
    try {
      if (typeof this.openai.responses?.create === "function") {
        const systemParts = messages
          .filter((m) => m.role === "system")
          .map((m) => m.content)
          .join("\n");
        const userParts = messages
          .filter((m) => m.role !== "system")
          .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
          .join("\n\n");

        const prompt = (systemParts ? systemParts + "\n\n" : "") + userParts;

        const response = await this.openai.responses.create({
          model,
          input: prompt,
          temperature,
          max_output_tokens: max_tokens,
        });

        let text = "";
        if (Array.isArray(response.output)) {
          for (const out of response.output) {
            if (Array.isArray(out.content)) {
              for (const c of out.content) {
                if (typeof c.text === "string") text += c.text;
              }
            }
          }
        }
        text = text?.trim() || response.output_text || "";
        return { text, raw: response };
      }
    } catch (err) {
      console.warn("⚠️ callOpenAI (responses API) failed:", err.message);
    }

    throw new Error("No compatible OpenAI API available");
  }

  // ---------- 🧠 AI Summary ----------
  async generateSummary(content) {
    try {
      const messages = [
        {
          role: "system",
          content: "Summarize the following note in 3–5 concise bullet points.",
        },
        { role: "user", content },
      ];

      const { text } = await this.callOpenAI(messages, {
        model: "gpt-4o-mini",
        max_tokens: 150,
        temperature: 0.5,
      });

      return text || "Summary unavailable.";
    } catch (error) {
      console.warn("⚠️ OpenAI summarization failed:", error.message);
      return this.localSummarize(content);
    }
  }

  // ---------- 🏷️ AI Tags ----------
  async generateTags(content) {
    try {
      const messages = [
        {
          role: "system",
          content:
            "Extract 3–5 short lowercase topic tags from the following note content. Return as a JSON array only.",
        },
        { role: "user", content },
      ];

      const { text } = await this.callOpenAI(messages, {
        model: "gpt-4o-mini",
        max_tokens: 60,
        temperature: 0.4,
      });

      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      return Array.isArray(parsed) ? parsed : this.localTags(content);
    } catch (error) {
      console.warn("⚠️ OpenAI tag generation failed:", error.message);
      return this.localTags(content);
    }
  }

  // ---------- ✍️ AI Enhancement ----------
  async enhanceWriting(content) {
    try {
      const messages = [
        {
          role: "system",
          content:
            "Improve the grammar, clarity, and structure of this note while keeping its meaning intact.",
        },
        { role: "user", content },
      ];

      const { text } = await this.callOpenAI(messages, {
        model: "gpt-4o-mini",
        max_tokens: 300,
        temperature: 0.8,
      });

      return text || content;
    } catch (error) {
      console.warn("⚠️ Enhancement failed, returning original:", error.message);
      return content;
    }
  }

  // ---------- 💡 AI Suggestions (OpenAI Only) ----------
async getSuggestions(content) {
  console.log("💡 AI Suggestion request received");

  if (!content || content.trim().length < 5) {
    return {
      title: "Untitled Note",
      tags: ["note"],
      nextLine: "Continue your thought here...",
    };
  }

  const messages = [
    {
      role: "system",
      content:
        "You are a helpful note assistant. Given a user's note, suggest a short, relevant title (3–6 words), 3 lowercase tags, and one logical next line. Return JSON ONLY with keys: title, tags, nextLine.",
    },
    { role: "user", content },
  ];

  try {
    // ✅ Call OpenAI Chat Model
    const { text } = await this.callOpenAI(messages, {
      model: "gpt-4o-mini",
      max_tokens: 150,
      temperature: 0.7,
    });

    // ✅ Parse and sanitize JSON response
    const cleaned = (text || "{}").replace(/```json|```/g, "").trim();
    let parsed = {};

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    const title = parsed.title?.trim() || "Untitled Note";
    const tags =
      Array.isArray(parsed.tags) && parsed.tags.length > 0
        ? parsed.tags.map((t) => t.toLowerCase().trim())
        : ["general"];
    const nextLine = parsed.nextLine?.trim() || "Continue writing...";

    console.log("✅ Suggestions Generated (AI):", { title, tags, nextLine });
    return { title, tags, nextLine };
  } catch (err) {
    // ❌ No fallback — only OpenAI
    console.error("⚠️ OpenAI suggestion generation failed:", err.message);
    throw new Error("AI suggestion generation failed");
  }
}

}

module.exports = new AIService();









{/*
  
  
  // ✅ NEW: Smart Suggestion Generator
  
  async getSuggestions(content) {
    console.log("💡 AI Suggestion request received");

    if (!content || content.trim().length < 5) {
      return {
        title: "Untitled Note",
        tags: ["note"],
        nextLine: "Continue your thought here...",
      };
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful note assistant. Given a user's note, suggest a title, 3 relevant lowercase tags, and one logical next line. Return JSON with keys: title, tags, nextLine.",
          },
          { role: "user", content },
        ],
        temperature: 0.7,
        max_tokens: 150,
      });

      const raw = response.choices?.[0]?.message?.content?.trim() || "{}";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      console.log("✅ Suggestions Generated:", parsed);
      return parsed;
    } catch (err) {
      console.warn("⚠️ Suggestion generation failed:", err.message);
      return {
        title: "Quick Note",
      //  tags: ["general"],
      //  nextLine: "You can add more details about this topic next.",
      };
    }
  }
  
  
  
  
  
  
  
  
  
  
  */}