import React from 'react';

interface Props {
  name: string;
}

function Heading({ name }: Props) {
  return (
    <>
      <div className="heading-container">
        <h1>Rang</h1>
      </div>
      <div
        style={{
          marginTop: '-20px',
          marginBottom: '10px',
          fontSize: '1.2rem',
          fontWeight: '500',
        }}
      >
        Good luck {name}!
      </div>
    </>
  );
}

export default Heading;
