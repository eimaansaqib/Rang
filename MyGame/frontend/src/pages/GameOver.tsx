import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import styled from '@emotion/styled';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

interface Props {
  socket: Socket<DefaultEventsMap, DefaultEventsMap>;
  id: number;
}

function GameOver({ socket, id }: Props) {
  const sampleWinners = ['', ''];
  const [winners, setWinners] = useState(sampleWinners);

  useEffect(() => {
    socket.emit('getWinners', { id });
    console.log('Requesting winners from server...');
    socket.on('announceWinners', ({ winners }) => {
      console.log('Winners received from server:', winners);
      setWinners(winners);
    });
  }, [socket, id]);

  return (
    <div>
      {winners[0] !== '' && winners[1] !== '' ? (
        <>
          <Title>Game Over!</Title>
          <SubTitle>
            {winners[0]} and {winners[1]} have won the game!
          </SubTitle>
        </>
      ) : null}
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

export default GameOver;
