import { useState } from "react";


function Summarizer({ extractedText }) {
  const [isProcessingSummarize, setIsProcessingSummarize] = useState(false);
  const [summaryText, setSummaryText] = useState(""); 

  const summary = async () => {
    setIsProcessingSummarize(true); 

    try {
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY_3;
      const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;

      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: "Summarize the following text concisely. Extract and display the following details line by line like numbered points without any special characters like (, ~, etc.) break the line and move to next line after every extracted content.:* Case Name: [Extracted case name] Plaintiff: [Extracted plaintiff name] Defendant: [Extracted defendant name] Legal Issues: [Extracted legal issues] Relevant Laws: [Extracted laws] Important Dates: [Extracted dates]*",
              },
            ],
          },
          contents: [
            {
              parts: [
                {
                  text: extractedText,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const summaryResult = result.candidates[0]?.content?.parts[0]?.text || "No summary available";

      setSummaryText(summaryResult); 
    } catch (error) {
      console.error("Error in Gemini Summarize API:", error);
    } finally {
      setIsProcessingSummarize(false);
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Summary</h2>

      {extractedText && (
        <div
          style={{
            marginTop: "20px",
            textAlign: "left",
            maxHeight: "300px",
            overflowY: "auto",
            border: "1px solid gray",
            padding: "10px",
          }}
        >
          <h3>Extracted Text:</h3>
          <p>{extractedText.substring(0, 500)}...</p>
        </div>
      )}

      <div style={{ marginTop: "10px" }}>
        <button onClick={summary} disabled={isProcessingSummarize}>
          {isProcessingSummarize ? "Processing..." : "Summarize"}
        </button>
      </div>

      {summaryText && (
        <div
          style={{
            marginTop: "20px",
            textAlign: "left",
            border: "1px solid gray",
            padding: "10px",
          }}
        >
          <h3>Summary:</h3>
          <p>{summaryText}</p>
        </div>
      )}
    </div>
  );
}

export default Summarizer;
