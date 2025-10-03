import { useState } from "react";
import "../styles/LexiBot.css";

function LexiBot() {
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const getResponse = async () => {
    if (!val.trim()) {  
      setErr("Please enter a valid input query.");
      return;
    }
    
    setErr(""); 
    setIsTyping(true);

    try {
      const options = {
        method: "POST",
        body: JSON.stringify({
          history: chatHistory,
          message: val,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      };
      const response = await fetch("https://jura-1.onrender.com/chat", options);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const data = await response.text();  

      setChatHistory((oldChatHistory) => [
        ...oldChatHistory,
        { role: "user", parts: val },
        { role: "LexiBot", parts: data },
      ]);
      setVal("");
    } catch (error) {
      console.error(error);
      setErr("Cannot process your request. Please try again later!");
    } finally {
      setIsTyping(false);
    }
  };

  const clear = () => {
    setVal("");
    setErr("");
    setChatHistory([]);
  };

  return (
    <div className="lexi-bot">
      <img
        src="jura-bot-img.jpeg"
        alt="LexiBot Image"
        onClick={() => setIsChatVisible(!isChatVisible)}
      />
      {isChatVisible && (
        <div className="chat-window">
          <div className="bot-response">
            {chatHistory.map((chatItem, idx) => (
              <div
                key={idx}
                className={`answer ${
                  chatItem.role === "user" ? "user-message" : "bot-message"
                }`}
              >
                <p>{chatItem.parts}</p>
              </div>
            ))}
          </div>
          {err && <p className="error-message">{err}</p>}
          {isTyping && (
            <div className="typing-indicator">
              <p>Lexi is typing...</p>
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          <div className="user-input-container">
            <textarea
              className="user-input"
              rows={1}
              value={val}
              placeholder="Ask your queries..."
              onChange={(e) => setVal(e.target.value)}
              required
            />
            <button className="chat-btn" onClick={getResponse}>
              Send
            </button>
            <button className="clear-btn" onClick={clear}>
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LexiBot;
