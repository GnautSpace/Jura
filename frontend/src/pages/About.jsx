import '../styles/About.css';

function About() {
  return (
    <div className="about-page">
      <h1>About Jura</h1>
      <p>
        Jura is a platform designed to make legal resources accessible to everyone, regardless of their education or background. 
        Our goal is to break down barriers to justice by providing tools like document summarization, text-to-speech for legal documents, 
        and a streamlined process to file complaints or find legal representation.
      </p>

      <section className="terms-privacy">
        <h2>Terms and Conditions</h2>
        <p>
          By using Jura, you agree to comply with our terms and conditions. We aim to provide accurate and up-to-date tools and resources,
          but we are not a substitute for professional legal advice.
        </p>

        <h2>Privacy Policy</h2>
        <p>
          Your privacy is important to us. Jura ensures that your personal data is securely stored and used only for the intended purposes.
          We do not share your data with third parties without your explicit consent.
        </p>
      </section>

      <section className="mission">
        <h2>Our Mission</h2>
        <p>
          At Jura, we believe that justice should be accessible to everyone. By leveraging technology, we aim to provide tools that simplify 
          complex legal processes and empower individuals to navigate the justice system with confidence.
        </p>
      </section>

     
    </div>
  );
}

export default About;
