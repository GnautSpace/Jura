import '../styles/About.css';
import { Link } from 'react-router-dom';
function About() {
  return (
    <main className="about-page">
      <section className="about-section">
        <h2>Who We Are</h2>
        <p>
          Jura is a platform designed to make legal resources accessible to everyone, regardless of 
          their education or background. Our goal is to break down barriers to justice by providing tools like 
          document summarization, text-to-speech for legal documents, and a streamlined process 
          to file complaints or find legal representation.
        </p>
      </section>

      <section className="about-section">
        <h2>Terms and Conditions</h2>
        <p>
          By using Jura, you agree to comply with our terms and conditions. We aim to provide accurate and 
          up-to-date tools and resources, but we are not a substitute for professional legal advice.
        </p>
      </section>

      <section className="about-section">
        <h2>Privacy Policy</h2>
        <p>
          Your privacy is important to us. Jura ensures that your personal data is securely stored and used 
          only for the intended purposes. We do not share your data with third parties without your explicit consent.
        </p>
      </section>

      <section className="about-section mission">
        <h2>Our Mission</h2>
        <p>
          At Jura, we believe that justice should be accessible to everyone. By leveraging technology, 
          we aim to provide tools that simplify complex legal processes and empower individuals to 
          navigate the justice system with confidence.
        </p>
      </section>

      <section className="cta">
        <h2>Ready to explore Jura?</h2>
        <p>Empower yourself with tools that bring justice closer to everyone.</p>
        <button className="cta-btn">
           <Link to="/" style={{textDecoration:'none'}}>
              Get Started
           </Link>
        </button>
      </section>
    </main>
  );
}

export default About;

