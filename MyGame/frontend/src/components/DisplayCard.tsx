import React from 'react';

interface Props {
  rank: string;
  suit: string;
}

function DisplayCard({ rank, suit }: Props) {
  return (
    <div className={`card rank-${rank} ${suit}`}>
      <span className="rank">{rank.toUpperCase()}</span>
      {suit === 'spades' ? (
        <span className="suit">&spades;</span>
      ) : suit === 'hearts' ? (
        <span className="suit">&hearts;</span>
      ) : suit === 'diams' ? (
        <span className="suit">&diams;</span>
      ) : suit === 'clubs' ? (
        <span className="suit">&clubs;</span>
      ) : null}
    </div>
  );
}

export default DisplayCard;
