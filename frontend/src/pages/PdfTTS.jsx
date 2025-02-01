import React, { useState, useRef, useEffect } from "react";
import "../styles/tts.css";
const Translator = ({ extractedText }) => {
  const [translatedText, setTranslatedText] = useState("");
  const [targetLang, setTargetLang] = useState("fr");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const speechSynthesisRef = useRef(null);
   
  useEffect(() => {
    const onVoicesChanged = () => {
      const voicesList = speechSynthesis.getVoices();
      setVoices(voicesList);
    };
  
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = onVoicesChanged;
    }
    onVoicesChanged();
  }, []);

  


  const GOOGLE_API_KEY = import.meta.env.GEMINI_API_KEY_2;

  const translateText = async () => {
    try {
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY_2;
      const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;
      console.log('API Key:', API_KEY);

      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: `Translate the following text ${extractedText} to ${targetLang}. Remove the markdown tags for example like (*,~):`
              }
            ],
          },
          contents: [{
            parts: [
              {
                text: extractedText,
              }
            ],
          }],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const translated = result.candidates[0].content.parts[0].text;
      setTranslatedText(translated);
      speakText(translated); 
    } catch (error) {
      console.error('Error in Gemini API:', error);
    }
  };

  const speakText = (text) => {
    if (speechSynthesis.speaking || isSpeaking) return; 
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    console.log(speechSynthesis.getVoices());
    
    const voice = voices.find(voice => voice.lang === targetLang); 
    if (voice) {
      utterance.voice = voice;
    } else {
      console.warn(`No voice found for ${targetLang}. Falling back to default voice.`);
    }

    speechSynthesis.speak(utterance);
    utterance.onend = () => setIsSpeaking(false);  
    speechSynthesisRef.current = utterance;
  };

  const pauseSpeech = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.pause();
    }
  };

  const resumeSpeech = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  };

  const stopSpeech = () => {
    speechSynthesis.cancel();  
    setIsSpeaking(false);
  };


  useEffect(() => {
    const handleVoicesChanged = () => {
      setVoices(speechSynthesis.getVoices());
    };

  
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = handleVoicesChanged;
    } else {
      setVoices(speechSynthesis.getVoices());
    }
  }, []);

  return (
    <div className="translator">
      <h2>Translate & Listen</h2>

      
      {/*<p className="mb-2">Text from PDF:</p>
      <p className="p-2 mb-2 bg-white rounded-md">{extractedText}</p> */}

      <select
        className="lang-opt"
        onChange={(e) => setTargetLang(e.target.value)}
      >
        <option value="fr">French</option>
        <option value="es">Spanish</option>
        <option value="de">German</option>
        <option value="hi">Hindi</option>
      </select>

      <button
        className="translate-btn"
        onClick={translateText}
      >
        {isSpeaking ? "Speaking..." : "Translate and Speak"}
      </button>

      <div className="control-btns">
        <button onClick={pauseSpeech} disabled={!isSpeaking}>Pause</button>
        <button onClick={resumeSpeech} disabled={isSpeaking}>Resume</button>
        <button onClick={stopSpeech}>Stop</button>
      </div>

      {translatedText && (
        <p className="translated-p">
          Translated: {translatedText}
        </p>
      )}
    </div>
  );
};

export default Translator;
