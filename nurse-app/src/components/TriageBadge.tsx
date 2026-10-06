import React from 'react';
import { AlertCircle, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { TriageLevel } from '../types';

interface TriageBadgeProps {
  level: TriageLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const TriageBadge: React.FC<TriageBadgeProps> = ({
  level,
  size = 'md',
  showLabel = true,
}) => {
  const config = {
    EMERGENCY: {
      text: 'SHOSHILINCH',
      subText: '1-daraja (Qizil)',
      bg: 'bg-red-50 text-red-600 border-red-500/50',
      dotBg: 'bg-red-500',
      icon: AlertCircle,
    },
    HIGH: {
      text: 'YUQORI XAVF',
      subText: '2-daraja (Sariq/To‘q)',
      bg: 'bg-orange-950/40 text-orange-400 border-orange-500/50',
      dotBg: 'bg-orange-500',
      icon: AlertTriangle,
    },
    MODERATE: {
      text: 'O‘RTA XAVF',
      subText: '3-daraja (Sariq)',
      bg: 'bg-amber-950/30 text-amber-400 border-amber-500/40',
      dotBg: 'bg-amber-500',
      icon: Clock,
    },
    LOW: {
      text: 'PAST XAVF',
      subText: '4-daraja (Yashil)',
      bg: 'bg-emerald-950/30 text-emerald-600 border-emerald-500/40',
      dotBg: 'bg-emerald-500',
      icon: CheckCircle2,
    },
  }[level];

  const Icon = config.icon;

  if (size === 'sm') {
    return (
      <span
        className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider border ${config.bg}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotBg}`} />
        <span>{config.text}</span>
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`flex items-center space-x-3 p-3 rounded-lg border ${config.bg}`}>
        <div className="p-2 rounded-md bg-slate-50/60 border border-current/20">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-wider">{config.text}</p>
          <p className="text-xs opacity-80">{config.subText}</p>
        </div>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wider border ${config.bg}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {showLabel && <span>{config.text}</span>}
    </span>
  );
};
