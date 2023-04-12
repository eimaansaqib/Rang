import React from 'react';

interface Props {
  players: { name: string; id: number }[];
}

function PlayerNames({ players }: Props) {
  return (
    <>
      <div className="game-players-container">
        <div className="player-tag player-one">
          {players.length === 4 && players[0].name}
        </div>
      </div>

      <div className="game-players-container">
        <div className="player-tag player-two">
          {players.length === 4 && players[1].name}
        </div>
      </div>

      <div className="game-players-container">
        <div className="player-tag player-three">
          {players.length === 4 && players[2].name}
        </div>
      </div>

      <div className="game-players-container">
        <div className="player-tag player-four">
          {players.length === 4 && players[3].name}
        </div>
      </div>
    </>
  );
}

export default PlayerNames;
