import {HashRouter  as Router,Routes,Route} from 'react-router-dom'

import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Features from './pages/Features'
import About from './pages/About'
import LexiBot from './pages/LexiBot'
import './App.css'

function App() {


  return (
    
    
      <Router>
        <Header/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/features" element={<Features/>}/>
          <Route path="/about" element={<About/>}/>
        </Routes>
        <LexiBot/>
        <Footer/>
      </Router>

    
  )
}

export default App
