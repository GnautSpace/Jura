import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "../styles/LexiBot.css";

function LexiBot() {
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [conversationId] = useState(() => `conv_${Date.now()}`);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  // Auto-focus textarea when chat opens
  useEffect(() => {
    if (isChatVisible && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isChatVisible]);

  // Initialize with welcome message
  useEffect(() => {
    if (chatHistory.length === 0) {
      setChatHistory([{
        role: "LexiBot",
        parts: "👋 Hello! I'm Lexi, your AI legal assistant. I can help you with legal questions, document analysis, and provide general legal guidance. How can I assist you today?",
        timestamp: new Date().toISOString(),
        id: `msg_${Date.now()}`
      }]);
    }
  }, [chatHistory.length]);

  const getResponse = async () => {
    if (!val.trim()) {  
      setErr("Please enter a valid legal question or query.");
      setTimeout(() => setErr(""), 3000);
      return;
    }
    
    setErr(""); 
    setIsTyping(true);
    setIsConnected(true);

    // Add user message immediately
    const userMessage = {
      role: "user",
      parts: val.trim(),
      timestamp: new Date().toISOString(),
      id: `msg_${Date.now()}_user`
    };

    setChatHistory(prev => [...prev, userMessage]);
    const currentMessage = val.trim();
    setVal("");

    try {
      console.log('🤖 Sending message to LexiBot backend...');
      
      const response = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentMessage,
          conversationId: conversationId,
          context: "legal_assistant"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📥 LexiBot response received');

      if (result.success) {
        const botMessage = {
          role: "LexiBot",
          parts: result.response || "I apologize, but I couldn't generate a response. Please try rephrasing your question.",
          timestamp: new Date().toISOString(),
          id: `msg_${Date.now()}_bot`,
          processingTime: result.processingTime
        };

        setChatHistory(prev => [...prev, botMessage]);
      } else {
        throw new Error(result.message || "Failed to get response from LexiBot");
      }

    } catch (error) {
      console.error("❌ LexiBot Error:", error);
      setIsConnected(false);
      
      let errorMessage = "I'm having trouble connecting right now. ";
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage += "Please make sure the backend server is running on port 3000.";
      } else if (error.message.includes('Invalid API key')) {
        errorMessage += "There's an issue with the AI service configuration.";
      } else {
        errorMessage += error.message;
      }

      const errorBotMessage = {
        role: "LexiBot",
        parts: `❌ ${errorMessage}\n\n🔧 Try:\n• Refreshing the page\n• Checking your internet connection\n• Contacting support if the issue persists`,
        timestamp: new Date().toISOString(),
        id: `msg_${Date.now()}_error`,
        isError: true
      };

      setChatHistory(prev => [...prev, errorBotMessage]);
      setErr("Connection error - please try again");
      setTimeout(() => setErr(""), 5000);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      getResponse();
    }
  };

  const clear = () => {
    setVal("");
    setErr("");
    setChatHistory([{
      role: "LexiBot",
      parts: "👋 Chat cleared! I'm ready to help with your legal questions. What would you like to know?",
      timestamp: new Date().toISOString(),
      id: `msg_${Date.now()}`
    }]);
  };

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
    if (!isChatVisible) {
      setErr(""); // Clear any errors when opening chat
    }
  };

  return (
    <div className="lexi-bot">
      {/* Chat Bot Avatar */}
      <div className="bot-avatar" onClick={toggleChat}>
        <img
          src="jura-bot-img.jpeg"
          alt="LexiBot - Your AI Legal Assistant"
          className={`bot-image ${isChatVisible ? 'active' : ''}`}
        />
        <div className="bot-status">
          <div className={`status-indicator ${isConnected ? 'online' : 'offline'}`}></div>
        </div>
        {!isChatVisible && (
          <div className="bot-notification">
            <span>💬</span>
          </div>
        )}
      </div>

      {/* Chat Window */}
      {isChatVisible && (
        <div className="chat-window">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="header-info">
              <img src="jura-bot-img.jpeg" alt="Lexi" className="header-avatar" />
              <div className="header-text">
                <h4>Lexi</h4>
                <span className={`status-text ${isConnected ? 'online' : 'offline'}`}>
                  {isConnected ? '🟢 Online' : '🔴 Offline'}
                </span>
              </div>
            </div>
            <div className="header-actions">
              <button className="minimize-btn" onClick={toggleChat} title="Minimize chat">
                ➖
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages">
            {chatHistory.map((chatItem) => (
              <div
                key={chatItem.id}
                className={`message ${chatItem.role === "user" ? "user-message" : "bot-message"} ${chatItem.isError ? "error-message" : ""}`}
              >
                <div className="message-content">
                  <div className="message-text">
                    <ReactMarkdown>{chatItem.parts}</ReactMarkdown>
                  </div>
                  <div className="message-time">
                    {new Date(chatItem.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                    {chatItem.processingTime && (
                      <span className="processing-time">
                        • {chatItem.processingTime}ms
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="message bot-message typing-message">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span>🤖 Lexi is thinking</span>
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Error Display */}
          {err && (
            <div className="error-banner">
              <span>⚠️ {err}</span>
            </div>
          )}

          {/* Input Area */}
          <div className="chat-input-area">
            <div className="input-container">
              <textarea
                ref={textareaRef}
                className="chat-input"
                rows={1}
                value={val}
                placeholder="Ask me anything about law, legal documents, or get legal advice..."
                onChange={(e) => setVal(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isTyping}
                maxLength={1000}
              />
              <div className="input-actions">
                <button 
                  className={`send-btn ${val.trim() ? 'active' : ''}`}
                  onClick={getResponse}
                  disabled={isTyping || !val.trim()}
                  title="Send message (Enter)"
                >
                  {isTyping ? '⏳' : '📤'}
                </button>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="quick-actions">
              <button className="quick-btn" onClick={clear} title="Clear conversation">
                🗑️ Clear
              </button>
              <button 
                className="quick-btn" 
                onClick={() => setVal("What are my rights as a tenant?")}
                title="Quick question about tenant rights"
              >
                🏠 Tenant Rights
              </button>
              <button 
                className="quick-btn" 
                onClick={() => setVal("How do I create a basic contract?")}
                title="Quick question about contracts"
              >
                📋 Contracts
              </button>
            </div>
            
            {/* Character Counter */}
            <div className="input-info">
              <span className="char-counter">{val.length}/1000</span>
              <span className="help-text">Press Enter to send, Shift+Enter for new line</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LexiBot;
