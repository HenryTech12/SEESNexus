import React from 'react';

const Badge = ({ variant = 'gray', children, className = '' }) => {
  const variants = {
    mint: 'bg-sees-mint/10 text-sees-mint border-sees-mint/20',
    mustard: 'bg-sees-mustard/10 text-sees-mustard border-sees-mustard/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    gray: 'bg-white/5 text-white/60 border-white/10'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
