import {useState} from "react";
import "../styles/Features.css";
import PdfExtractor from "./PdfExtractor"; 
import Translator from "./PdfTTS";
import Summarizer from "./Summarizer";

function Features() {
  const [extractedText, setExtractedText] = useState("");
  const handleTextExtracted = (text) => {
    setExtractedText(text);  
  };
  return (
    <div className="features-wrapper">
      <h2 className="section-title">Explore Our Features</h2>

      <div className="features-grid">
       
      <div className="feature-card">
          <h3>Upload PDF and Extract Text</h3>
          <p>Upload a PDF file, and we will extract the text for further processing.</p>
          <PdfExtractor onTextExtracted={handleTextExtracted} /> 
          {extractedText && <Summarizer extractedText={extractedText} />} 
        </div>


        <div className="feature-card">
          <h3>Text-to-Speech</h3>
          <p>Listen to your legal documents in your preferred language.</p>
          {extractedText && <Translator extractedText={extractedText} />} 
        </div>
      </div>
    </div>
  );
}

export default Features;
