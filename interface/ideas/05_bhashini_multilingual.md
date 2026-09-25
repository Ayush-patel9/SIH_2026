# Feature 05: Bhashini Multilingual NLP & Transliteration

## 1. Executive Summary & Value Proposition
Public procurement in India occurs across state boundaries where tender documents and queries are frequently drafted in regional Indian languages (Hindi, Tamil, Telugu, Gujarati, Marathi, Bengali, Kannada, Malayalam). Generic machine translation often misinterprets domain-specific technical terms (e.g. translating "सरिया" to general "stick" instead of "TMT Reinforcement Steel Bars").
By integrating **MeitY's Bhashini NLP Pipeline Architecture**, the system performs vernacular transliteration, domain entity grounding, and multilingual search querying.

---

## 2. What We CAN Implement Right Now (Without Pipeline Data)
- **Multilingual Language Picker & Keyboard Transliteration Input**: UI language selector supporting 8+ major languages (`en`, `hi`, `ta`, `te`, `gu`, `mr`, `bn`, `kn`) that populates `QueryRequest.input.language`.
- **Domain Technical Glossary Translator Simulator**: Client-side dictionary mapping vernacular engineering keywords (e.g., `सीमेंट` $\rightarrow$ `IS 269`, `सरिया` $\rightarrow$ `IS 1786`, `बिजली के तार` $\rightarrow$ `IS 694`) to canonical English terms before sending to the backend.
- **Multilingual UI Localization Engine**: Full i18n localization dictionary translating UI headers, badges, and labels into Hindi, Tamil, and English.
- **Bhashini Request Dispatcher**: API client configured to format requests for Bhashini's ASR (speech-to-text) and NMT (neural machine translation) schemas.

---

## 3. What We CANNOT Implement Right Now (Blocked on Friend's Pipeline)
- Live production connection to MeitY Bhashini API server using official Ministry auth keys.
- Real-time cross-lingual vector embeddings across vernacular full texts.

---

## 4. The Key-and-Lock Bridge (JSON Binding)

### The Key (`StandardsResponse.multilingual` from `API_CONTRACT_SCHEMA.md`):
```json
{
  "multilingual": {
    "bhashini_used": true,
    "detected_input_language": "hi",
    "response_language": "hi",
    "available_translations": ["hi", "ta", "te", "mr", "gu", "bn"]
  }
}
```

### The Lock (How Application Consumes It):
- When `detected_input_language != "en"`, displays a "Processed via Bhashini NLP" badge with original script and transliterated English technical keywords.
- Toggling available language tabs dynamically translates plain-language explanations.

---

## 5. Architectural & Implementation Plan

### Modules to Build:
1. `src/modules/i18n/languageContext.tsx`: React context & hook for global language switching.
2. `src/modules/i18n/technicalLexicon.ts`: Hardcoded bilingual technical synonym lookup table.
3. `src/modules/i18n/bhashiniClient.ts`: Schema client for Bhashini NMT inference endpoints.

### Edge-Case Handling:
- Mixed-script query (Hinglish: `"Flyover ke liye 53 grade cement standard"`): Successfully extracts technical grade `53 grade` and product `cement`.
