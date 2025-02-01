import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker"; 

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

function PdfExtractor({ onTextExtracted }) {  
  const [loading, setLoading] = useState(false);

  const extractTextFromPDF = async (file) => {
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        const pdf = await pdfjsLib.getDocument({ data: reader.result }).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => item.str).join(" ") + " ";
        }
        onTextExtracted(text);  
      } catch (error) {
        console.error("PDF Processing Error:", error);
        alert("Failed to extract text from PDF.");
      }
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <input type="file" accept="application/pdf" onChange={(e) => extractTextFromPDF(e.target.files[0])} />
      {loading && <p>Processing PDF...</p>}
    </div>
  );
}

export default PdfExtractor;
