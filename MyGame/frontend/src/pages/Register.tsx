import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import styled from '@emotion/styled';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

interface Props {
  socket: Socket<DefaultEventsMap, DefaultEventsMap>;
  id: number;
}

function Register({ socket, id }: Props) {
  const [name, setName] = useState('');
  const [gameStatus, setGameStatus] = useState('');

  useEffect(() => {
    socket.emit('getGameStatus', { id: id });

    socket.on('gameStatus', ({ data }) => {
      setGameStatus(data);
    });
  }, [socket, id]);

  useEffect(() => {
    if (gameStatus === 'gameOver') {
      window.location.href = '/gameover';
    }
  }, [socket, id, gameStatus]);

  const handleClick = (e: any) => {
    e.preventDefault();
    if (name === '') {
      alert('Please enter your name!');
      return;
    }
    if (gameStatus === 'startGame') {
      alert('Too many players!');
      return;
    }
    socket.emit('register', { id: id, name: name });
    window.location.href = '/loading';
  };

  return (
    <div>
      <Title>Rung Online</Title>
      <SubTitle>Get Started!</SubTitle>
      <Form>
        <FormInput
          type="text"
          placeholder="Enter your name"
          defaultValue=""
          onChange={(e) => setName(e.target.value)}
        />
        <FormButton onClick={handleClick}>Start Game</FormButton>
      </Form>
    </div>
  );
}

const Title = styled.h1`
  color: #ffffff;
  font-size: 2.5rem;
  text-align: center;
  font-weight: 500;
  margin-top: 7rem;
  margin-bottom: 0;
`;

const SubTitle = styled.h2`
  color: #ffffff;
  font-size: 1.5rem;
  text-align: center;
  font-weight: 400;
  margin-top: 0;
`;

const Form = styled.form`
  text-align: center;
  margin-top: 7rem;
`;

const FormInput = styled.input`
  padding: 1rem;
  border: none;
  border-radius: 0.5rem;
  width: 20rem;
  margin-right: 1rem;
`;

const FormButton = styled.button`
  padding: 0.8rem;
  border: solid 3px #bfab25;
  border-radius: 0.5rem;
  background-color: #bfab25;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
`;

export default Register;
