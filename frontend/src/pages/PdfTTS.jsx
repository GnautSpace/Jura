import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

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

  const translateText = async () => {
    try {
      // Use your secure backend instead of direct API calls
      const BACKEND_URL = `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/chat`;

      // Create language mapping for better user experience
      const languageNames = {
        'fr': 'French',
        'es': 'Spanish',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese',
        'ar': 'Arabic',
        'hi': 'Hindi',
        'en': 'English'
      };

      const targetLanguage = languageNames[targetLang] || targetLang;

      const translationPrompt = `Translate the following text ${extractedText} to ${targetLanguage}. Remove the markdown tags for example like (*,~):

        Text to translate:
        ${extractedText}`;

      console.log('Sending translation request to backend...');

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: translationPrompt
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Backend error ${response.status}: ${errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('Backend translation response received');
      
      if (result.success) {
        const translated = result.response || "Translation not available";
        setTranslatedText(translated);
        console.log('Translation completed successfully');
        speakText(translated); 
      } else {
        console.error("Backend error:", result.message);
        setTranslatedText(`Error: ${result.message}\n\nHow to fix: ${result.fixableReason || 'Please try again'}`);
      }
    } catch (error) {
      console.error('Error calling backend for translation:', error);
      
      if (error.message.includes('Failed to fetch')) {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
        setTranslatedText(`Connection Error: Cannot reach the backend server.

🔧 How to fix:
1. Make sure your backend server is running
2. Run: npm run dev (in the backend folder)
3. Check that the server is running on ${apiUrl}

Error details: ${error.message}`);
      } else {
        setTranslatedText(`Translation Error: ${error.message}

Please try again. If the problem persists, check the browser console for more details.`);
      }
    }
  };

  const speakText = (text) => {
    if (speechSynthesis.speaking || isSpeaking) return; 
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Enhanced voice matching logic
    const findBestVoice = (targetLang) => {
      if (!voices || voices.length === 0) {
        console.log("No voices available yet, using default");
        return null;
      }

      // 1. Try exact match first
      let voice = voices.find(v => v.lang === targetLang);
      if (voice) {
        console.log(`Found exact voice match: ${voice.name} (${voice.lang})`);
        return voice;
      }

      // 2. Try partial match (e.g., 'hi' matches 'hi-IN')
      voice = voices.find(v => v.lang.startsWith(targetLang + '-'));
      if (voice) {
        console.log(`Found partial voice match: ${voice.name} (${voice.lang})`);
        return voice;
      }

      // 3. Try reverse partial match (e.g., 'hi-IN' matches 'hi')
      voice = voices.find(v => targetLang.startsWith(v.lang));
      if (voice) {
        console.log(`Found reverse partial voice match: ${voice.name} (${voice.lang})`);
        return voice;
      }

      // 4. Log available voices for debugging
      console.log("🔍 Available voices:", voices.map(v => `${v.name} (${v.lang})`));
      console.warn(`⚠️ No voice found for '${targetLang}'. Available languages: ${[...new Set(voices.map(v => v.lang))].join(', ')}`);
      
      return null;
    };

    const selectedVoice = findBestVoice(targetLang);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      // Set the language even without a specific voice
      utterance.lang = targetLang;
      console.log(`Using default voice with language: ${targetLang}`);
    }

    // Set speech rate and pitch for better quality
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

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
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Debug log for voice availability
      if (availableVoices.length > 0) {
        console.log('Available TTS Voices:', 
          availableVoices.map(v => `${v.name} (${v.lang})`).join(', ')
        );
        console.log('Supported Languages:', 
          [...new Set(availableVoices.map(v => v.lang))].sort().join(', ')
        );
      }
    };

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = handleVoicesChanged;
    } else {
      handleVoicesChanged();
    }
    
    // Initial load with a small delay to ensure voices are loaded
    setTimeout(handleVoicesChanged, 100);
  }, []);

  return (
    <div className="translator">
      <h2>Translate & Listen</h2>

      
      {/*<p className="mb-2">Text from PDF:</p>
      <p className="p-2 mb-2 bg-white rounded-md">{extractedText}</p> */}

      <select
        className="lang-opt"
        value={targetLang}
        onChange={(e) => setTargetLang(e.target.value)}
      >
        <option value="en">English</option>
        <option value="es">Spanish (Español)</option>
        <option value="fr">French (Français)</option>
        <option value="de">German (Deutsch)</option>
        <option value="it">Italian (Italiano)</option>
        <option value="pt">Portuguese (Português)</option>
        <option value="ru">Russian (Русский)</option>
        <option value="ja">Japanese (日本語)</option>
        <option value="ko">Korean (한국어)</option>
        <option value="zh">Chinese (中文)</option>
        <option value="ar">Arabic (العربية)</option>
        <option value="hi">Hindi (हिन्दी)</option>
        <option value="bn">Bengali (বাংলা)</option>
        <option value="ur">Urdu (اردو)</option>
        <option value="ta">Tamil (தமிழ்)</option>
        <option value="te">Telugu (తెలుగు)</option>
        <option value="mr">Marathi (मराठी)</option>
        <option value="gu">Gujarati (ગુજરાતી)</option>
        <option value="kn">Kannada (ಕನ್ನಡ)</option>
        <option value="ml">Malayalam (മലയാളം)</option>
        <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
      </select>

      {/* Voice availability indicator */}
      <div className="voice-info" style={{ margin: '10px 0', fontSize: '12px', color: '#666' }}>
        {voices.length > 0 ? (
          <>
            🎯 Available voices: {voices.length} | 
            {voices.find(v => v.lang === targetLang || v.lang.startsWith(targetLang + '-')) ? 
              ` ✅ Voice found for ${targetLang}` : 
              ` ⚠️ No specific voice for ${targetLang} (will use default)`
            }
          </>
        ) : (
          'Loading voices...'
        )}
      </div>

      <button
        className="translate-btn"
        onClick={translateText}
        disabled={!extractedText?.trim()}
      >
        {isSpeaking ? "Speaking..." : "Translate and Speak"}
      </button>

      <div className="control-btns">
        <button onClick={pauseSpeech} disabled={!isSpeaking} alt="pause">⏸</button>
        <button onClick={resumeSpeech} disabled={isSpeaking} alt="play">▶</button>
        <button onClick={stopSpeech} alt="stop">⏹</button>
      </div>

      {translatedText && (
        <p className="translated-p">
          Translated: {translatedText}
        </p>
      )}
    </div>
  );
};

Translator.propTypes = {
  extractedText: PropTypes.string.isRequired,
};

export default Translator;
