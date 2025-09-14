import React from 'react';

export const TestComponent: React.FC = () => {
  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg z-50">
      <h3 className="font-bold">TEST - Changements visibles !</h3>
      <p>Si vous voyez ce message, les changements sont pris en compte</p>
      <p className="text-xs">Timestamp: {new Date().toLocaleTimeString()}</p>
    </div>
  );
};
