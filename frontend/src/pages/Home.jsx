import '../styles/Home.css';

import LegalQuote from './Quotes'

function Home() {
    return (
        <>
            <div className="hero-section">
                <h1>JURA</h1>
                <p>Justice for All.</p>
                <LegalQuote/>
                <button
                    className="hero-btn"
                    aria-label="Explore Jura"
                    onClick={() => window.location.href = "/features"}
                >
                    Explore
                </button>
            </div>
            
        </>
    );
}

export default Home;
