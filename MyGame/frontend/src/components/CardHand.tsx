import React from 'react';

interface Props {
  rank: string;
  suit: string;
  onClick: any;
}

function CardHand({ rank, suit, onClick }: Props) {
  return (
    <li onClick={onClick}>
      <a className={`card rank-${rank} ${suit}`}>
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
      </a>
    </li>
  );
}

export default CardHand;
