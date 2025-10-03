import { useState } from "react";
import PropTypes from "prop-types";


function Summarizer({ extractedText }) {
  const [isProcessingSummarize, setIsProcessingSummarize] = useState(false);
  const [summaryText, setSummaryText] = useState(""); 

  const summary = async () => {
    setIsProcessingSummarize(true); 

    try {
      // Use your secure backend instead of direct API calls
      const BACKEND_URL = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/chat`;

      const summaryPrompt = `Summarize the following text concisely. Extract and display the following details line by line like numbered points without any special characters like (, ~, etc.) break the line and move to next line after every extracted content.:* Case Name: [Extracted case name] Plaintiff: [Extracted plaintiff name] Defendant: [Extracted defendant name] Legal Issues: [Extracted legal issues] Relevant Laws: [Extracted laws] Important Dates: [Extracted dates]*
            
        Document text:
        ${extractedText}`;

      console.log('📤 Sending summarization request to backend...');

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: summaryPrompt
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Backend error ${response.status}: ${errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('Backend response:', result);
      
      if (result.success) {
        setSummaryText(result.response || "No summary available");
        console.log('✅ Summarization completed successfully');
      } else {
        console.error("❌ Backend error:", result.message);
        setSummaryText(`Error: ${result.message}\n\nHow to fix: ${result.fixableReason || 'Please try again'}`);
      }
    } catch (error) {
      console.error("❌ Error calling backend:", error);
      
      if (error.message.includes('Failed to fetch')) {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        setSummaryText(`❌ Connection Error: Cannot reach the backend server.

🔧 How to fix:
1. Make sure your backend server is running
2. Run: npm run dev (in the backend folder)
3. Check that the server is running on ${apiUrl}

Error details: ${error.message}`);
      } else {
        setSummaryText(`❌ Error: ${error.message}

Please try again. If the problem persists, check the browser console for more details.`);
      }
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
Summarizer.propTypes = {
  extractedText: PropTypes.string.isRequired,
};

export default Summarizer;
