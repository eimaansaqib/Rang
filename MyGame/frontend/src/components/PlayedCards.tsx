import React from 'react';
import DisplayCard from './DisplayCard';

interface Props {
  firstHand: any;
}

function PlayedCards({ firstHand }: Props) {
  return (
    <div className="card-area">
      <div className="card-area-rows output-row-one">
        {firstHand.length === 4 && firstHand[2].id !== -1 ? (
          <DisplayCard rank={firstHand[2].rank} suit={firstHand[2].suit} />
        ) : null}
      </div>
      <div
        className={
          firstHand.length === 4 &&
          firstHand[1].id === -1 &&
          firstHand[3].id !== -1
            ? 'card-area-rows output-row-two-right'
            : 'card-area-rows output-row-two-between'
        }
      >
        {firstHand.length === 4 && firstHand[1].id !== -1 ? (
          <DisplayCard rank={firstHand[1].rank} suit={firstHand[1].suit} />
        ) : null}
        {firstHand.length === 4 && firstHand[3].id !== -1 ? (
          <DisplayCard rank={firstHand[3].rank} suit={firstHand[3].suit} />
        ) : null}
      </div>
      <div className="card-area-rows output-row-three">
        {firstHand.length === 4 && firstHand[0].id !== -1 ? (
          <DisplayCard rank={firstHand[0].rank} suit={firstHand[0].suit} />
        ) : null}
      </div>
    </div>
  );
}

export default PlayedCards;
