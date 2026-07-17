import React from 'react';

const Input = ({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-white/70 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-sees-mint transition-colors">
            <Icon size={20} />
          </div>
        )}
        <input
          id={id}
          className={`sees-input ${Icon ? 'pl-12' : ''} ${error ? 'border-red-500/50 focus:border-red-500/80 focus:ring-red-500/20' : ''}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-400 ml-1 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
