import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import styled from '@emotion/styled';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { ThreeDots } from 'react-loader-spinner';

interface Props {
  socket: Socket<DefaultEventsMap, DefaultEventsMap>;
  id: number;
}

function Loading({ socket, id }: Props) {
  const [name, setName] = useState('');
  const [gameStatus, setGameStatus] = useState('');

  useEffect(() => {
    socket.emit('getGameStatus', { id: id });

    socket.on('gameStatus', ({ data }) => {
      setGameStatus(data);
    });
  }, [socket, id]);

  useEffect(() => {
    socket.emit('getName', { id: id });
  }, [socket, id]);

  useEffect(() => {
    socket.on('registered', ({ name }) => {
      setName(name);
    });
  }, [socket, id]);

  useEffect(() => {
    if (gameStatus === 'startGame') {
      window.location.href = '/home';
    } else if (gameStatus === 'gameOver') {
      window.location.href = '/gameover';
    }
  }, [socket, id, gameStatus]);

  return (
    <div>
      <Title>Welcome {name}!</Title>
      <SubTitle>Please wait while other players join</SubTitle>
      <LoaderDiv>
        <Loader />
      </LoaderDiv>
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

const LoaderDiv = styled.div`
  width: 80px;
  margin: 0 auto;
`;

const Loader = styled(ThreeDots)`
  height: 80px;
  width: 80px;
  radius: 9px;
  color: #4fa94d;
  text-align: center;
  aria-label: three-dots-loading;
  visible: true;
`;

export default Loading;
