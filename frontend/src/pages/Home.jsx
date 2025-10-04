import '../styles/Home.css';
import { useNavigate, Link } from 'react-router-dom';

import LegalQuote from './Quotes'

function Home() {
    const navigate = useNavigate();
    return (
        <>
            <div className="hero-section">
                <h1>JURA</h1>
                <p>Justice for All.</p>
                <LegalQuote/>
                <button
                    className="hero-btn"
                    aria-label="Explore Jura"
                    onClick={() => navigate('/features')}
                >
                <Link to="/features" style={{textDecoration:'none'}}>
                    Explore
                </Link>
                </button>
            </div>
            
        </>
    );
}

export default Home;
