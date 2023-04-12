import React from 'react';
import CardHand from './CardHand';

interface Props {
  hand: { rank: string; suit: string }[];
  rang: string;
  onSelectCard: any;
}

function CardsContainer({ hand, rang, onSelectCard }: Props) {
  return (
    <div className="right-side-container my-cards-container">
      <h1>My Cards</h1>
      <h4
        style={{
          marginTop: '-1.5rem',
          marginBottom: '0',
          fontSize: '1.2rem',
          fontWeight: '500',
        }}
      >
        Rang: {rang}
      </h4>

      <div className="my-cards-inner-container">
        <ul className="hand">
          {hand.map((card) => (
            <CardHand
              rank={card.rank}
              suit={card.suit}
              onClick={() => onSelectCard(card)}
              key={hand.indexOf(card)}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CardsContainer;
