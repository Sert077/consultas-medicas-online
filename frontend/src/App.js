//import logo from './logo.svg';
//import './App.css';
//function App() {
//  return (
  //  <div className="App">
    //  <header className="App-header">
      //  <img src={logo} className="App-logo" alt="logo" />
        //<p>
          //Edit <code>src/App.js</code> and save to reload.
        //</p>
        //<a
          //className="App-link"
          //href="https://reactjs.org"
          //target="_blank"
          //rel="noopener noreferrer"
        //>
          //Learn React
        //</a>
      //</header>
    //</div>
  //);
//}

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import RegisterDoctor from './components/RegisterDoctor';
import Doctores from './components/Doctores'; 
import DoctorDetail from './components/DoctorDetail';  // Importa el nuevo componente
import Header from './components/Header';
import Footer from './components/Footer';
import './css/style.css';

function App() {
    return (
        <div className="App">
            <Router>
                <Header /> {/* Aquí agregas el Header para que aparezca en todas las rutas */}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<RegisterDoctor />} />
                    <Route path="/doctores" element={<Doctores />} /> 
                    <Route path="/doctores/:id" element={<DoctorDetail />} /> {/* Nueva ruta */}
                </Routes>
                <Footer />
            </Router>
        </div>
    );
}

export default App;





