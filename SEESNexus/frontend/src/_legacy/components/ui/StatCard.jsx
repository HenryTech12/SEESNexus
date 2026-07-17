import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'mint'
}) => {
  const colors = {
    mint: 'text-sees-mint bg-sees-mint/10',
    mustard: 'text-sees-mustard bg-sees-mustard/10',
    blue: 'text-blue-400 bg-blue-500/10',
    red: 'text-red-400 bg-red-500/10',
    purple: 'text-purple-400 bg-purple-500/10'
  };

  return (
    <div className="glass-card p-6 flex items-center justify-between group hover:shadow-sees-glow transition-all duration-300">
      <div>
        <p className="text-white/60 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white">{value}</h3>
        {trend && (
          <div className={`flex items-center mt-2 text-xs font-semibold ${trend > 0 ? 'text-sees-mint' : 'text-red-400'}`}>
            {trend > 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
            {Math.abs(trend)}%
            <span className="text-white/40 ml-1 font-normal">vs last month</span>
          </div>
        )}
      </div>
      <div className={`p-4 rounded-xl ${colors[color]} group-hover:scale-110 transition-transform duration-300`}>
        {Icon && <Icon size={28} />}
      </div>
    </div>
  );
};

export default StatCard;
