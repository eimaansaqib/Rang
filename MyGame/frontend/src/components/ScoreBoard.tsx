import React from 'react';

interface Props {
  players: { name: string; id: number }[];
  scores: { score: number; id: number }[];
}

function ScoreBoard({ players, scores }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'space-between',
        fontSize: '1.2rem',
        marginTop: '10px',
      }}
    >
      <div style={{ marginRight: '15px' }}>
        {players[0].name}: {scores[0].score}
      </div>
      <div style={{ marginRight: '15px' }}>
        {players[1].name}: {scores[1].score}
      </div>
      <div style={{ marginRight: '15px' }}>
        {players[2].name}: {scores[2].score}
      </div>
      <div style={{ marginRight: '15px' }}>
        {players[3].name}: {scores[3].score}
      </div>
    </div>
  );
}

export default ScoreBoard;
