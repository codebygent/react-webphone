import React from 'react';

const DialPad = ({ onDigitClick }) => {
  const dialPadButtons = [
    { digit: '1', letters: '' },
    { digit: '2', letters: 'ABC' },
    { digit: '3', letters: 'DEF' },
    { digit: '4', letters: 'GHI' },
    { digit: '5', letters: 'JKL' },
    { digit: '6', letters: 'MNO' },
    { digit: '7', letters: 'PQRS' },
    { digit: '8', letters: 'TUV' },
    { digit: '9', letters: 'WXYZ' },
    { digit: '*', letters: '' },
    { digit: '0', letters: '+' },
    { digit: '#', letters: '' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {dialPadButtons.map(({ digit, letters }) => (
        <button
          key={digit}
          className="uj-btn"
          onClick={() => onDigitClick(digit)}
        >
          <p className="">{digit}</p>
          {letters && <span className="">{letters}</span>}
        </button>
      ))}
    </div>
  );
};

export default DialPad;