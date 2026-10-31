import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, borderClass }) => {
  return (
    <div className={`bg-white rounded-xl border ${borderClass || 'border-slate-200'} p-5 shadow-sm hover:shadow transition-shadow flex items-start justify-between`}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
