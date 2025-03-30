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
import "leaflet/dist/leaflet.css";
//import ChatComponent from './components/ChatComponent';
import MisReservas from './components/MisReservas';
import Chat from './components/Chat';
import VerifyEmail from './components/VerifyEmail';
import EditPatient from './components/EditPatient';
import HistorialConsultas from './components/HistorialConsultas';
import Chatbot from './components/Chatbot';
import ReprogramarConsulta from './components/ReprogramarConsulta';
import Conocenos from "./components/Conocenos"
import MediTestLogoOptions from './components/meditest-logo-vanilla';
import PacientesAtendidos from './components/PacientesAtendidos';
import ResetPassword from './components/ResetPassword';

function App() {
    return (
        <div className="App">
            <Router>
                <Header /> {/* Aquí agregas el Header para que aparezca en todas las rutas */}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/conocenos" element={<Conocenos />} />
                    <Route path="/registerdoctor" element={<RegisterDoctor />} />
                    <Route path="/doctores" element={<Doctores />} /> 
                    <Route path="/doctores/:id" element={<DoctorDetail />} /> {/* Detalles de doctor */}
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/send-email" element={<EmailForm />} />
                    {/*<Route path="/chat/:consultaId" element={<ChatComponent />} />*/}
                    <Route path="/misreservas" element={<MisReservas />} />
                    <Route path="/chat/:chatId" element={<Chat />} />  {/* Nueva ruta para el chat */}
                    <Route path="/edit-patient" element={<EditPatient />} />
                    <Route path="/verify-email/:token" element={<VerifyEmail />} />
                    <Route path="/historial-consultas" element={<HistorialConsultas />} />
                    <Route path="/reprogramar/:token" element={<ReprogramarConsulta />} />
                    <Route path="/pacientes" element={<PacientesAtendidos />} />
                    <Route path="/meditest-logo" element={<MediTestLogoOptions />} />
                    <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
                    {/* Puedes agregar más rutas aquí */}
                </Routes>
                <Footer />
                <Chatbot /> {/* Agregar chatbot debajo del footer */}
            </Router>
        </div>
    );
}

export default App;