import React, { useState, useEffect } from "react";
import "../styles/Quotes.css";

const legalQuotes = [
  { quote: "The law is reason, free from passion.", author: "Aristotle" },
  { quote: "Justice delayed is justice denied.", author: "William E. Gladstone" },
  { quote: "Injustice anywhere is a threat to justice everywhere.", author: "Martin Luther King Jr." },
  { quote: "The good of the people is the greatest law.", author: "Cicero" },
  { quote: "The power of the lawyer is in the uncertainty of the law.", author: "Jeremy Bentham" },
  
    { quote: "The law is reason, free from passion.", author: "Aristotle" },
    { quote: "Justice delayed is justice denied.", author: "William E. Gladstone" },
    { quote: "Injustice anywhere is a threat to justice everywhere.", author: "Martin Luther King Jr." },
    { quote: "The good of the people is the greatest law.", author: "Cicero" },
    { quote: "The power of the lawyer is in the uncertainty of the law.", author: "Jeremy Bentham" },
    { quote: "Laws grind the poor, and rich men rule the law.", author: "Oliver Goldsmith" },
    { quote: "It is not wisdom but authority that makes a law.", author: "Thomas Hobbes" },
    { quote: "When men are pure, laws are useless; when men are corrupt, laws are broken.", author: "Benjamin Disraeli" },
    { quote: "Where there is no law, there is no freedom.", author: "John Locke" },
    { quote: "If we desire respect for the law, we must first make the law respectable.", author: "Louis D. Brandeis" },
    { quote: "Laws are like cobwebs, which may catch small flies, but let wasps and hornets break through.", author: "Jonathan Swift" },
    { quote: "A judge is a law student who marks his own examination papers.", author: "H.L. Mencken" },
    { quote: "An unjust law is no law at all.", author: "Saint Augustine" },
    { quote: "The safety of the people shall be the highest law.", author: "Cicero" },
    { quote: "The first duty of society is justice.", author: "Alexander Hamilton" },
    { quote: "To live outside the law, you must be honest.", author: "Bob Dylan" },
    { quote: "A lawyer without books would be like a workman without tools.", author: "Thomas Jefferson" },
    { quote: "He who decides a case without hearing the other side, though he decides justly, cannot be considered just.", author: "Seneca" },
    { quote: "Better to have bad laws than no laws at all.", author: "Napoleon Bonaparte" }

  
];

const LegalQuote = () => {
  const [currentQuote, setCurrentQuote] = useState(legalQuotes[0]);

  useEffect(() => {
    const changeQuote = () => {
      const randomIndex = Math.floor(Math.random() * legalQuotes.length);
      setCurrentQuote(legalQuotes[randomIndex]);
    };
    const interval = setInterval(changeQuote, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="quote-container">
      <p className="quote">"{currentQuote.quote}"</p>
      <p className="author">— {currentQuote.author}</p>
    </div>
  );
};

export default LegalQuote;
