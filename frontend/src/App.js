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
import Register from './components/Register';
import Login from './components/Login';
import EmailForm from './components/EmailForm';
import './css/style.css';
//import ChatComponent from './components/ChatComponent';
import MisReservas from './components/MisReservas';
import Chat from './components/Chat';
import VerifyEmail from './components/VerifyEmail';
import EditPatient from './components/EditPatient';
function App() {
    return (
        <div className="App">
            <Router>
                <Header /> {/* Aquí agregas el Header para que aparezca en todas las rutas */}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/registerdoctor" element={<RegisterDoctor />} />
                    <Route path="/doctores" element={<Doctores />} /> 
                    <Route path="/doctores/:id" element={<DoctorDetail />} /> {/* Nueva ruta */}
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/send-email" element={<EmailForm />} />
                    {/*<Route path="/chat/:consultaId" element={<ChatComponent />} />*/}
                    <Route path="/misreservas" element={<MisReservas />} />
                    <Route path="/chat/:chatId" element={<Chat />} />  {/* Nueva ruta para el chat */}
                    <Route path="/edit-patient" element={<EditPatient />} />
                    <Route path="/verify-email/:token" element={<VerifyEmail />} />
                </Routes>
                <Footer />
            </Router>
        </div>
    );
}

export default App;





