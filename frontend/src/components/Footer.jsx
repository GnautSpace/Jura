import LexiBot from '../pages/LexiBot';
import './Header.css';
function Footer(){
    return(
        <footer>
        <p>&copy; {new Date().getFullYear()} Jura. All rights reserved.</p>
      </footer>
    );
}
export default Footer;