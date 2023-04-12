import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import HomePage from './pages/Home';
import Register from './pages/Register';
import Loading from './pages/Loading';
import GameOver from './pages/GameOver';

import { io } from 'socket.io-client';
const socket = io('http://localhost:3001', { transports: ['websocket'] });
socket.connect();

function App() {
  // getting ID of player if it is already stored in session storage
  const newID = sessionStorage.getItem('id') || '-1';
  sessionStorage.setItem('id', newID);
  const [ID, setId] = useState(parseInt(sessionStorage.getItem('id') || '-1'));

  useEffect(() => {
    // route to registration page if the game is already full
    socket.on('connectionRefused', (data: any) => {
      if (window.location.href !== 'http://localhost:3000/') {
        window.location.href = '/';
      }
    });

    // server proposes an ID for the player if they don't have one
    // if the player doesn't have an ID, they establish a connection with the server-proposed ID
    // if the player already has an ID, they establish a connection with their ID
    socket.on('connected', ({ id }) => {
      if (parseInt(sessionStorage.getItem('id') || '-1') === -1) {
        sessionStorage.setItem('id', id.toString());
        setId(id);
      }
      socket.emit('acceptedConnection', {
        id: parseInt(sessionStorage.getItem('id') || '-1'),
      });
    });
  }, []);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Register socket={socket} id={ID} />} />
          <Route
            path="/loading"
            element={<Loading socket={socket} id={ID} />}
          />
          <Route path="/home" element={<HomePage socket={socket} id={ID} />} />
          <Route
            path="/gameover"
            element={<GameOver socket={socket} id={ID} />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
