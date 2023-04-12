import React from 'react';

interface Props {
  onSelectRang: any;
}

function SelectRang({ onSelectRang }: Props) {
  return (
    <div className="select-rang-container">
      <h3>Select Rang:</h3>
      <button
        className="button-select-rang"
        onClick={() => onSelectRang('Diamonds')}
      >
        Diamonds
      </button>
      <button
        className="button-select-rang"
        onClick={() => onSelectRang('Hearts')}
      >
        Hearts
      </button>
      <button
        className="button-select-rang"
        onClick={() => onSelectRang('Spades')}
      >
        Spades
      </button>
      <button
        className="button-select-rang"
        onClick={() => onSelectRang('Clubs')}
      >
        Clubs
      </button>
    </div>
  );
}

export default SelectRang;
