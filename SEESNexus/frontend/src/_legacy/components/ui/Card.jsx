import React from 'react';

const Card = ({ children, className = '', hover = false }) => {
  return (
    <div className={`glass-card p-6 ${hover ? 'hover:shadow-sees-glow transition-all duration-300' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
